import express from "express";
import postgresDB from "../../db/databaseLocalPG.js";
import axios from 'axios'

const router = express.Router();

const retrieveAPIKeys = (req, next) => {
    try {
    return new Promise((resolve, reject) => {
        if (req.session === undefined) throw new Error("Request not associated with session.");
        const db = postgresDB;
        const resData = { login: 0 }; //
        const uID = req.session["uID"];
        const apiKeysQuery = `
        SELECT apikey, apialias, ratelimit, exchangelist, defaultexchange, widgetsetup, templogin
        FROM users
        WHERE id = ${uID}
        `;
        
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
    } catch (error) {
        next(error);
    }
};

//checks login status when site is initialy loaded.
router.get("/checkLogin", async (req, res, next) => {

    if (req.session && req.session.login === true) {
        console.log('getting local login') 
        const apiKeys = await retrieveAPIKeys(req, next)
        res.status(200).json(apiKeys);
    } else {
        console.log('checking remote login')
        const axiosRes = await axios('http://gstreet.test/api/remoteLogin', {method: 'GET', mode: '*'}).catch((err)=>{console.log('axios err', err)})
        console.log('res', axiosRes.data)
        console.log("not logged in");
        res.status(401).json({ login: 0 });
    }
    
});

export default router;
