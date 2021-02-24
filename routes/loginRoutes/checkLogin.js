const express = require("express");
const router = express.Router();
// const format = require('pg-format');
// const md5 = require("md5");
const db = process.env.live === '1' ? 
require("../../db/databaseLive.js") :  
require("../../db/databaseLocalPG.js") ;

//checks login status when site is initialy loaded.
router.get("/checkLogin", (req, res, next) => {
    const resData = { login: 0 };
    const uID = req.session["uID"];
    const apiKeysQuery = `
        SELECT apikey, webhook, ratelimit, exchangelist, defaultexchange 
        FROM users
        WHERE id = ${uID}
    `;
    // console.log(apiKeysQuery)
    const retrieveAPIKeys = () => {
        // console.log("getting APIKeys");
        // console.log(req.session);

        return new Promise((resolve, reject) => {
            db.query(apiKeysQuery, (err, rows) => {
                if (err) {
                    console.log("error retrieving apiKeys");
                    reject(resData);
                } else {
                resData.apiKey = rows.rows[0].apikey;
                resData.exchangelist = rows.rows[0].exchangelist;
                resData.defaultexchange = rows.rows[0].defaultexchange;
                resData.login = 1;
                resData.ratelimit = rows.rows[0].ratelimit
                resolve(resData);
                }
            });
        });
    };
    // console.log("CHECK LOGIN SESSION", req.session)
    if (req.session.login === true) {
        retrieveAPIKeys()
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(401).json(err);
        });
    } else {
        res.status(401).json({ login: 0 });
    }
});

module.exports = router;