const express = require("express");
const router = express.Router();
// const format = require('pg-format');
// const md5 = require("md5");
const db = process.env.live === '1' ? 
require("../../db/databaseLive.js") :  
require("../../db/databaseLocalPG.js") ;

//checks login status when site is initialy loaded.
router.get("/checkLogin", (req, res, next) => {
    console.log("/checkLogin", req.session)
    let resData = { login: 0 };
    let uID = req.session["uID"];
    let apiKeysQuery = `
        SELECT apikey, webhook, ratelimit, exchangelist, defaultexchange 
        FROM users
        WHERE id = ${uID}
    `;
    const retrieveAPIKeys = () => {
        console.log("getting APIKeys");
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

    if (req.session.login === true) {
        retrieveAPIKeys()
        .then((data) => {
            console.log("login data: ", data);
            res.json(data);
        })
        .catch((err) => {
            res.json(err);
        });
    } else {
        console.log("not logged in");
        res.json({ login: 0 });
    }
});

module.exports = router;