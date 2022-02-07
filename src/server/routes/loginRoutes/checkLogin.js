import express from "express";
import postgresDB from "../../db/databaseLocalPG.js";

const router = express.Router();

//checks login status when site is initialy loaded.
router.get("/checkLogin", (req, res, next) => {
    const db = postgresDB;
    const resData = { login: 0 }; //
    const uID = req.session["uID"];
    const apiKeysQuery = `
        SELECT apikey, apialias, ratelimit, exchangelist, defaultexchange, widgetsetup, templogin
        FROM users
        WHERE id = ${uID}
    `; //add a timeout to the WHERE clause on resetpasswordlink using templogin timestamp
    const retrieveAPIKeys = () => {
        console.log("checking login status", apiKeysQuery);
        return new Promise((resolve, reject) => {
            db.query(apiKeysQuery, (err, rows) => {
                if (err) {
                    console.log("error retrieving apiKeys");
                    reject(resData);
                } else {
                    console.log("getting user data");
                    resData.apiKey = rows.rows[0].apikey;
                    resData.apiAlias = rows.rows[0].apialias;
                    resData.exchangelist = rows.rows[0].exchangelist;
                    resData.defaultexchange = rows.rows[0].defaultexchange;
                    resData.login = 1;
                    resData.ratelimit = rows.rows[0].ratelimit;
                    resData.widgetsetup = rows.rows[0].widgetsetup;
                    console.log("returning user data", resData);
                    resolve(resData);
                }
            });
        });
    };

    retrieveAPIKeys()
        .then((data) => {
            if (req.session.login === true) {
                console.log("session login is true");
                res.status(200).json(data);
            } else {
                console.log("not logged in");
                res.status(401).json({ login: 0 });
            }
        })
        .catch((err) => {
            console.log("/checkLogin", err);
            res.status(401).json(err);
        });
});

export default router;
