import express from "express";
import format from "pg-format";
import postgresDB from "./../../db/databaseLocalPG.js";

const router = express.Router();

router.get("/dashboard", (req, res, next) => {
    //returns requested dashboard to user.
    const db = postgresDB;
    if (req.session.login === true) {
        const getSavedDashBoards = `
            SELECT *
            FROM dashBoard AS d
            LEFT JOIN widgets AS w ON d.id = w.dashboardkey
            WHERE d.userID =${req.session.uID}`;
        const getMenuSetup = `
            SELECT *
            FROM menuSetup AS m
            LEFT JOIN menus AS s ON m.id = s.menukey
            WHERE userID =${req.session.uID}`;
        const r = {
            //resultset
            savedDashBoards: {},
            menuSetup: {},
            default: "",
            message: "",
        };
        db.query(getSavedDashBoards, (err, rows, next) => {
            if (err) {
                console.log(err);
                res.json({ message: "Failed to retrieve dashboards" });
            } else {
                const result = rows.rows;
                for (const row in result) {
                    //For each widget in dashboard
                    if (r.savedDashBoards[result[row].dashboardname] === undefined) {
                        r.savedDashBoards[result[row].dashboardname] = {
                            dashboardname: result[row].dashboardname,
                            globalstocklist: result[row].globalstocklist,
                            id: result[row].id,
                            widgetlist: {},
                        };
                    }
                    const resultKey = result[row].dashboardname;
                    const newObject = {
                        column: result[row].columnid,
                        columnOrder: result[row].columnorder,
                        config: result[row].config,
                        filters: result[row].filters,
                        trackedStocks: result[row].trackedstocks,
                        widgetConfig: result[row].widgetconfig,
                        widgetHeader: result[row].widgetheader,
                        widgetID: result[row].widgetid,
                        widgetType: result[row].widgettype,
                        yAxis: result[row].yaxis,
                        xAxis: result[row].xaxis,
                        showBody: result[row].showbody,
                    };
                    r.savedDashBoards[resultKey].widgetlist[newObject.widgetID] = newObject;
                }

                db.query(getMenuSetup, (err, rows) => {
                    if (err) {
                        console.log(err);
                        res.json({ message: "Failed to retrieve menu setup." });
                    } else {
                        const result = rows.rows;
                        if (rows.rows[0] !== undefined) {
                            r.default = rows.rows[0].defaultmenu;
                            for (const row in result) {
                                const thisRow = result[row];
                                r.menuSetup[thisRow["widgetid"]] = {
                                    column: thisRow.columnid,
                                    columnOrder: thisRow.columnorder,
                                    widgetConfig: thisRow.widgetconfig,
                                    widgetHeader: thisRow.widgetheader,
                                    widgetID: thisRow.widgetid,
                                    widgetType: thisRow.widgettype,
                                    xAxis: thisRow.xaxis,
                                    yAxis: thisRow.yaxis,
                                };
                            }
                            res.status(200).json(r);
                        } else {
                            res.status(401).json({ message: "No dashboards retrieved" });
                        }
                    }
                });
            }
        });
    } else {
        console.log("LOGIN IS FALSE----", req.session);
        res.status(401).json({ message: "Not logged in." });
    }
});

router.post("/dashboard", (req, res, next) => {
    //saves users dashboard
    const db = postgresDB;
    if (req.session.login === true) {
        let dashBoardName = format("%L", req.body.dashBoardName);
        let globalStockList = format("%L", JSON.stringify(req.body.globalStockList));
        const saveDashBoardSetup = (userID) => {
            return new Promise((resolve, reject) => {
                const saveDashBoardSetupQuery = `
        INSERT INTO dashboard 
        (userID, dashBoardName, globalStockList) 
        VALUES (${userID}, ${dashBoardName},${globalStockList})
        ON CONFLICT (userID, dashboardname) 
        DO UPDATE SET globalstocklist = EXCLUDED.globalstocklist
        RETURNING ID
        `;
                db.query(saveDashBoardSetupQuery, (err, rows) => {
                    if (err) {
                        reject("Failed to save dashboard", err);
                        console.log("Failed to save dashboard");
                    } else {
                        const widgetList = req.body.widgetList;
                        let querList = `DELETE FROM widgets WHERE dashboardkey = ${rows.rows[0].id};`; //upsert for each widget in widgetlist
                        for (const widget in widgetList) {
                            const w = widgetList[widget];
                            const thisFilter = JSON.stringify(w.filters);
                            const trackedStocks = JSON.stringify(w.trackedStocks);
                            const saveWidget = `
                INSERT INTO widgets
                (dashboardkey, columnid, columnorder, config, filters, trackedstocks, widgetconfig, widgetheader, widgetid, widgettype, xaxis, yaxis, showBody)
                VALUES(
                ${format("%L", rows.rows[0].id)}, 
                ${format("%L", w.column)}, 
                ${format("%L", w.columnOrder)}, 
                ${format("%L", w.config)}, 
                ${format("%L", thisFilter)}, 
                ${format("%L", trackedStocks)}, 
                ${format("%L", w.widgetConfig)}, 
                ${format("%L", w.widgetHeader)}, 
                ${format("%L", w.widgetID)}, 
                ${format("%L", w.widgetType)}, 
                ${format("%L", w.xAxis)}, 
                ${format("%L", w.yAxis)},
                ${format("%L", w.showBody)}
                )
                ON CONFLICT (dashboardkey, widgetid)
                DO UPDATE SET columnid = EXCLUDED.columnid , columnorder = EXCLUDED.columnorder, filters = EXCLUDED.filters,
                trackedStocks = EXCLUDED.trackedStocks, widgetconfig = EXCLUDED.widgetconfig, 
                widgetheader = EXCLUDED.widgetheader,xaxis = EXCLUDED.xaxis, yaxis = EXCLUDED.yAxis,
                showBody = EXCLUDED.showBody
                ;
                `;
                            querList = querList + saveWidget;
                        }
                        // console.log('querList:', querList)
                        db.query(querList, (err, rows) => {
                            if (err) {
                                reject("Failed to save widget", err);
                                console.log("Failed to save widget", err);
                            } else {
                                resolve(userID);
                            }
                        });
                    }
                });
            });
        };

        const updateMenuSetup = (data) => {
            return new Promise((resolve, reject) => {
                let saveMenuSetupQuery = `INSERT INTO menuSetup 
            (userID, defaultMenu)
            VALUES (${data}, ${dashBoardName}) 
            ON CONFLICT (userID) 
            DO UPDATE SET defaultMenu = EXCLUDED.defaultMenu
            RETURNING ID
            `;
                // console.log("SAVE MENUSETUP:", saveMenuSetupQuery)

                db.query(saveMenuSetupQuery, (err, rows) => {
                    if (err) {
                        reject("Failed to save menu setup", err);
                    } else {
                        const menuList = req.body.menuList;
                        let queryList = `DELETE FROM menus WHERE menukey = ${rows.rows[0].id};`; //upsert for each widget in widgetlist
                        for (const widget in menuList) {
                            const w = menuList[widget];
                            const saveMenu = `
                INSERT INTO menus
                (menukey, columnid, columnorder, widgetconfig, widgetheader, widgetid, widgettype, xaxis, yaxis)
                VALUES(
                ${format("%L", rows.rows[0].id)}, 
                ${format("%L", w.column)}, 
                ${format("%L", w.columnOrder)},  
                ${format("%L", w.widgetConfig)}, 
                ${format("%L", w.widgetHeader)}, 
                ${format("%L", w.widgetID)}, 
                ${format("%L", w.widgetType)}, 
                ${format("%L", w.xAxis)}, 
                ${format("%L", w.yAxis)}
                )
                ON CONFLICT (menukey, widgetid)
                DO UPDATE SET columnid = EXCLUDED.columnid , columnorder = EXCLUDED.columnorder, 
                widgetconfig = EXCLUDED.widgetconfig, 
                widgetheader = EXCLUDED.widgetheader,xaxis = EXCLUDED.xaxis, yaxis = EXCLUDED.yAxis;

                `;
                            queryList = queryList + saveMenu;
                        }
                        // console.log(queryList)
                        db.query(queryList, (err, rows) => {
                            if (err) {
                                reject("Failed to save menu", err);
                                console.log("Failed to save menu", err);
                            } else {
                                resolve("saved");
                            }
                        });
                    }
                });
            });
        };

        saveDashBoardSetup(req.session.uID)
            .then((data) => {
                // console.log('HERE', data);
                return updateMenuSetup(data);
            })
            .then(() => {
                res.status(200).json({ message: "Save Complete" });
            })
            .catch((err) => {
                console.log("/dashboard post error, updateMenuSetup: ", err);
                res.status(400).json({ message: "Problem saving dashboard." });
            });
    } else {
        res.status(401).json({ message: "Not logged in." });
    }
});

router.post("/renameDashboard", (req, res, next) => {
    //{newName: string, dbID: number}
    const db = postgresDB;
    if (req.session.login === true) {
        let newName = format("%L", req.body.newName);
        let dbID = format("%L", req.body.dbID);
        const getSavedDashBoards = `
            UPDATE dashboard
            SET dashboardname = ${newName}
            WHERE userid = ${req.session.uID} AND id = ${dbID}`;
        db.query(getSavedDashBoards, (err, rows) => {
            if (err) {
                res.status(401).json({ message: "Dashboard name update failed." });
                console.log("Dashboard name update failed:", err);
            } else {
                res.status(200).json({ message: "name update success." });
            }
        });
    }
});

export default router;
