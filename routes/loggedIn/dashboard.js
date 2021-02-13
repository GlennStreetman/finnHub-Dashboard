const express = require("express");  
const router = express.Router();
const format = require("pg-format");

const db = process.env.live === "1" ? require("../../db/databaseLive.js") : require("../../db/databaseLocalPG.js");

router.get("/dashboard", (req, res, next) => {
    // console.log("------------------GETTING DASHBOARD-------------")
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
        console.log(getMenuSetup)
            // console.log("QUERIES:", getSavedDashBoards, getMenuSetup)
        const r = { //resultset
            savedDashBoards: {},
            menuSetup: {},
            default: '',
        };
        db.query(getSavedDashBoards, (err, rows, next) => {
            if (err) {
                console.log(err)
                res.json({message: "Failed to retrieve dashboards"});
            } else {
                const result = rows.rows;
                for (const row in result) {
                    if (r.savedDashBoards[result[row].dashboardname] === undefined){
                        r.savedDashBoards[result[row].dashboardname] = {
                            dashboardname: result[row].dashboardname,
                            globalstocklist: result[row].globalstocklist,
                            id:  result[row].id,
                            widgetlist: {}
                    }
                    }
                    const resultKey = result[row].dashboardname
                    const newObject = {
                    column: result[row].columnid, 
                    columnOrder: result[row].columnorder,
                    filters: result[row].filters,
                    trackedStocks: result[row].trackedstocks,
                    widgetConfig: result[row].widgetconfig,
                    widgetHeader: result[row].widgetheader,
                    widgetID: result[row].widgetid, 
                    widgetType: result[row].widgettype,
                    yAxis: result[row].yaxis,
                    xAxis: result[row].xaxis,
                    }
                    // console.log("KEYS:", r.savedDashBoards, "---",resultKey, newObject)
                    r.savedDashBoards[resultKey].widgetlist[newObject.widgetID] = newObject
                    // console.log(r)
            }
            
            db.query(getMenuSetup, (err, rows , next) => {
                if (err) {
                    console.log(err)
                    res.json({message: "Failed to retrieve menu setup."});
                } else {
                    console.log("menu setup retrieved");
                    
                    const result = rows.rows;
                    if (rows.rows[0] !== undefined) {
                        r.default = rows.rows[0].defaultmenu
                        // console.log("MENUSETUPROWS", rows.rows)
                        for (const row in result) {
                        const thisRow = result[row]
                        r.menuSetup[thisRow['widgetid']] = {
                            // id: thisRow.id,
                            // userid: thisRow.userid,
                            // defaultmenu: thisRow.defaultmenu,
                            // menulist: {
                            column: thisRow.columnid,
                            columnOrder: thisRow.columnorder,
                            widgetConfig: thisRow.widgetconfig,
                            widgetHeader: thisRow.widgetheader,
                            widgetID: thisRow.widgetid,
                            widgetType: thisRow.widgettype,
                            xAxis: thisRow.xaxis,
                            yAxis: thisRow.yaxis,
                            // },
                        }
                    }
                    // resultSet["menuSetup"] = result;
                    console.log("returning dashboard and menu data");
                    res.json(r);
                } else {
                    console.log("no dashboard retrieved")
                    const error = new Error('No dashboard');
                    error.status = 500
                    next(error)
                }
            }});
            }
        });
    } else {res.json({message: "Not logged in."})}
});

router.post("/dashboard", (req, res, next) => {
    
    if (req.session.login === true) {  
    // console.log("--------post dashboard-------------", req.body)
    let dashBoardName = format("%L", req.body.dashBoardName);
    let globalStockList = format("%L", JSON.stringify(req.body.globalStockList));
    // let widgetList = format("%L", JSON.stringify(req.body.widgetList));
    // let menuList = format("%L", JSON.stringify(req.body.menuList));

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
        // console.log(saveDashBoardSetupQuery)
        db.query(saveDashBoardSetupQuery, (err, rows) => {
            if (err) {
            reject("Failed to save dashboard", err);
            console.log("Failed to save dashboard");
            } else {
            // console.log("dashboard data updated.", rows.rows[0].id);
            const widgetList = req.body.widgetList
            let querList = `DELETE FROM widgets WHERE dashboardkey = ${rows.rows[0].id};` //upsert for each widget in widgetlist
            for (const widget in widgetList){
                const w = widgetList[widget]
                const thisFilter = JSON.stringify(w.filters)
                const trackedStocks = JSON.stringify(w.trackedStocks)
                const saveWidget = `
                INSERT INTO widgets
                (dashboardkey, columnid, columnorder, filters, trackedstocks, widgetconfig, widgetheader, widgetid, widgettype, xaxis, yaxis)
                VALUES(
                ${format("%L", rows.rows[0].id)}, 
                ${format("%L", w.column)}, 
                ${format("%L", w.columnOrder)}, 
                ${format("%L", thisFilter)}, 
                ${format("%L", trackedStocks)}, 
                ${format("%L", w.widgetConfig)}, 
                ${format("%L", w.widgetHeader)}, 
                ${format("%L", w.widgetID)}, 
                ${format("%L", w.widgetType)}, 
                ${format("%L", w.xAxis)}, 
                ${format("%L", w.yAxis)}
                )
                ON CONFLICT (dashboardkey, widgetid)
                DO UPDATE SET columnid = EXCLUDED.columnid , columnorder = EXCLUDED.columnorder, filters = EXCLUDED.filters,
                trackedStocks = EXCLUDED.trackedStocks, widgetconfig = EXCLUDED.widgetconfig, 
                widgetheader = EXCLUDED.widgetheader,xaxis = EXCLUDED.xaxis, yaxis = EXCLUDED.yAxis;

                `
                querList = querList + saveWidget
            }
            // console.log('querList:', querList)
            db.query(querList, (err, rows) => {
                if (err) {
                reject("Failed to save widget", err);
                console.log("Failed to save widget", err);
                } else {
                resolve(userID);
                }
            })
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
            const menuList = req.body.menuList
            let queryList = `DELETE FROM menus WHERE menukey = ${rows.rows[0].id};` //upsert for each widget in widgetlist
            for (const widget in menuList){
                const w = menuList[widget]
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

                `
                queryList = queryList + saveMenu
            }
            // console.log(queryList)
            db.query(queryList, (err, rows) => {
                if (err) {
                reject("Failed to save menu", err);
                console.log("Failed to save menu", err);
                } else {
                res.json({message: "Save Complete"});
                }
            })
            
            }
        });
        });
    };

    saveDashBoardSetup(req.session.uID)
        .then((data) => {
        // console.log(data);
        return updateMenuSetup(data);
        })
        .then((data) => {
        // console.log(data);
        res.json({message: "true"});
        })
        .catch((err) => res.json(err));
    } else {res.json({message: "Not logged in."})}
});

module.exports = router;