import express from "express";
import postgresDB from "../../db/databaseLocalPG.js";
import format from "pg-format";

const router = express.Router();

//checks login status when site is initialy loaded.
router.get("/checkLogin", (req, res, next) => {
    console.log("--CHECKING LOGIN--", req.query);
    const resetKey = req.query["reset"] ? format(req.query["reset"]) : false;
    console.log("resetkey", resetKey);
    const db = postgresDB;
    const resData = { login: 0 }; //
    const uID = req.session["uID"];
    const resetLink = resetKey ? ` OR resetpasswordlink = '${resetKey}'` : "";
    const apiKeysQuery = `
        SELECT apikey, apialias, ratelimit, exchangelist, defaultexchange, widgetsetup, templogin
        FROM users
        WHERE id = ${uID} ${resetLink}
    `; //add a timeout to the WHERE clause on resetpasswordlink using templogin timestamp
    console.log("apiKeysQuery", apiKeysQuery);
    const retrieveAPIKeys = () => {
        console.log("running retrieval");
        return new Promise((resolve, reject) => {
            db.query(apiKeysQuery, (err, rows) => {
                console.log("rows");
                console.log(rows);
                if (err) {
                    console.log("error retrieving apiKeys");
                    reject(resData);
                } else {
                    console.log("rows", rows);
                    resData.apiKey = rows.rows[0].apikey;
                    resData.apiAlias = rows.rows[0].apialias;
                    resData.exchangelist = rows.rows[0].exchangelist;
                    resData.defaultexchange = rows.rows[0].defaultexchange;
                    resData.login = 1;
                    resData.ratelimit = rows.rows[0].ratelimit;
                    resData.widgetsetup = rows.rows[0].widgetsetup;
                    if (rows.rows[0].templogin && Date.now() - rows.rows[0].templogin < 900000) {
                        console.log("RESET LINK FOR USER VISITED"); //if user got here from reset link, issued in last 15 minutes. 1000 x 60 x 15
                        req.session.login = true;
                    }

                    resolve(resData);
                }
            });
        });
    };

    retrieveAPIKeys()
        .then((data) => {
            if (req.session.login === true) {
                res.status(200).json(data);
            } else {
                res.status(401).json({ login: 0 });
            }
        })
        .catch((err) => {
            console.log("Check login error", err);
            res.status(401).json(err);
        });
});

export default router;
