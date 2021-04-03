import express from 'express';
import format from 'pg-format';
import dbLive from "./../../db/databaseLive.js";
import devDB from "./../../db/databaseLocalPG.js";
const router = express.Router();
const db = process.env.live === "1" ? dbLive : devDB;
router.get("/deleteSavedDashboard", (req, res, next) => {
    if (req.session.login === true) {
        const uId = req.session["uID"];
        const deleteDash = format("%L", req.query["dashID"]);
        const deleteSQL = `
            DELETE FROM dashBoard WHERE userID=${uId} AND id=${deleteDash};
        `;
        let checkDefault = `
        SELECT dashboard.id 
        FROM menuSetup 
        LEFT JOIN dashboard ON dashboard.dashboardname = menuSetup.defaultMenu
        WHERE menuSetup.userID = ${uId}
        `;
        let updateDefault = `
            UPDATE menuSetup SET defaultMenu = (
            SELECT dashboardname
            FROM dashboard
            WHERE userid = ${uId} AND id = (SELECT min(id) FROM dashboard where userid=${uId})
            )
            `;
        console.log(uId, deleteSQL, checkDefault, updateDefault);
        const deleteDashboard = () => {
            console.log("deleting dashboard");
            return new Promise((resolve, reject) => {
                db.query(deleteSQL, (err, rows) => {
                    if (err) {
                        reject("failed to delete dashboard", err);
                    }
                    else {
                        console.log("dashboard deleted");
                        resolve("dashboard deleted");
                    }
                });
            });
        };
        //if default dashboard is deleted set default to oldest dashboard
        const checkDefaultMenu = () => {
            console.log("checking default");
            return new Promise((resolve, reject) => {
                db.query(checkDefault, (err, rows) => {
                    if (err) {
                        console.log("error on checking default dash");
                        reject("Error on checking default dash");
                    }
                    else {
                        // console.log(rows.rows[0].id, deleteDash);
                        rows.rows[0].defaultmenu === undefined ? resolve("success") : reject("Updating default not needed");
                    }
                });
            });
        };
        const updateDefaultMenu = () => {
            console.log("reseting default");
            return new Promise((resolve, reject) => {
                db.query(updateDefault, (err, rows) => {
                    if (err) {
                        console.log("error reseting default");
                        reject("Failed to reset default dasbboard");
                    }
                    else {
                        resolve("success");
                    }
                });
            });
        };
        deleteDashboard()
            .then((data) => {
            // console.log(data);
            return checkDefaultMenu();
        })
            .then((data) => {
            // console.log(data);
            return updateDefaultMenu();
        })
            .then((data) => {
            res.status(200).json({ message: "Dashboard deleted" });
        })
            .catch((err) => {
            console.log("ERROR:", err);
            res.status(400).json({ message: 'Problem deleting dashboard.' });
        });
    }
    else {
        console.log("NOT LOGGED IN");
        res.status(401).json({ message: "Not logged in." });
    }
});
export default router;
//# sourceMappingURL=deleteSavedDashboard.js.map