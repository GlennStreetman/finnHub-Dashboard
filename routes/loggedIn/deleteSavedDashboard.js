const express = require("express");  
const router = express.Router();
const format = require("pg-format");
const db = process.env.live === "1" ? require("../../db/databaseLive.js") : require("../../db/databaseLocalPG.js");

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
        WHERE userid = ${uId}`;
    // console.log(deleteSQL);
    // console.log(uId, deleteSQL);
    const deleteDashboard = () => {
        console.log("deleting dashboard");
        return new Promise((resolve, reject) => {
        db.query(deleteSQL, (err, rows) => {
            if (err) {
            reject("failed to delete dashboard", err);
            } else {
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
            } else {
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
            } else {
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
        // console.log(data);
        res.json({message: "success"});
        })
        .catch((err) => {
        console.log(err);
        res.json(err);
        });
    } else {res.json({message: "Not logged in."})}
});

module.exports = router;