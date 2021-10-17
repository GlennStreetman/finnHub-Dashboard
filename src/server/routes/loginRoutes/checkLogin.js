import express from 'express';
import devDB from "../../db/databaseLocalPG.js"

const router = express.Router();
const db =  devDB

//checks login status when site is initialy loaded.
router.get("/checkLogin", (req, res, next) => {
    const resData = { login: 0 };
    const uID = req.session["uID"];
    const apiKeysQuery = `
        SELECT apikey, apialias, webhook, ratelimit, exchangelist, defaultexchange, widgetsetup
        FROM users
        WHERE id = ${uID}
    `;
    console.log(apiKeysQuery)
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
                resData.apiAlias = rows.rows[0].apialias
                resData.exchangelist = rows.rows[0].exchangelist;
                resData.defaultexchange = rows.rows[0].defaultexchange;
                resData.login = 1;
                resData.ratelimit = rows.rows[0].ratelimit
                resData.widgetsetup = rows.rows[0].widgetsetup
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

export default router;