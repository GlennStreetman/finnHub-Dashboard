import express from "express";
import postgresDB from "../../db/databaseLocalPG.js";
import axios from "axios";

const router = express.Router();

const retrieveAPIKeys = (req, next) => {
    try {
        return new Promise((resolve, reject) => {
            if (req.session === undefined)
                throw new Error("Request not associated with session.");
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
                    console.log(
                        "retrieveAPIKeys: returning user data",
                        resData
                    );
                    resolve(resData);
                }
            });
        });
    } catch (error) {
        next(error);
    }
};

const retrieveAPIKeysEmail = (req, email, next) => {
    try {
        return new Promise((resolve, reject) => {
            if (req.session === undefined)
                throw new Error("Request not associated with session.");
            const db = postgresDB;
            const resData = { login: 0 }; //
            const apiKeysQuery = `
        SELECT apikey, apialias, ratelimit, exchangelist, defaultexchange, widgetsetup, templogin, id
        FROM users
        WHERE email = '${email}'
        `;

            db.query(apiKeysQuery, (err, rows) => {
                if (err) {
                    console.log("error retrieving apiKeys");
                    reject(resData);
                } else {
                    req.session.login = true;
                    req.session["uID"] = rows.rows[0].id;
                    console.log("getting user data");
                    resData.apiKey = rows.rows[0].apikey;
                    resData.apiAlias = rows.rows[0].apialias;
                    resData.exchangelist = rows.rows[0].exchangelist;
                    resData.defaultexchange = rows.rows[0].defaultexchange;
                    resData.login = 1;
                    resData.ratelimit = rows.rows[0].ratelimit;
                    resData.widgetsetup = rows.rows[0].widgetsetup;
                    console.log(
                        "retrieveAPIKeysEmail returning user data ",
                        resData
                    );
                    resolve(resData);
                }
            });
        });
    } catch (error) {
        next(error);
    }
};

const registerRemoteUser = (email, next) => {
    //if remote user does not exist, add registration
    console.log("---remote register----");
    try {
        const db = postgresDB;
        const tryRegister = `
            INSERT INTO users
            (email, exchangelist, defaultexchange, ratelimit , emailconfirmed)
            VALUES ('${email}', 'US', 'US', 1, 'true')
        `;
        console.log("tryRegister", tryRegister);
        db.query(tryRegister, (err, rows) => {
            if (err) {
                console.log(`${email} already registered`);
            } else {
                console.log(`registration complete: ${email}`);
            }
        });
    } catch (err) {
        next(err);
    }
};

//checks login status when site is initialy loaded.
router.get("/api/checkLogin", async (req, res, next) => {
    // console.log("remote login", process.env.useRemoteLogin);
    if (req.session && req.session.login === true) {
        //if user has logged in session.
        console.log("getting local login:");
        const apiKeys = await retrieveAPIKeys(req, next);
        res.status(200).json(apiKeys);
    } else if (process.env.useRemoteLogin == "true") {
        //if user does not have logged in sesion, check remote
        console.log("checking remote login5:", process.env.remoteLoginUrl);
        const copyCookies = req.header("cookie");
        console.log("remote login url", process.env.remoteLoginUrl);
        const axiosRes = await axios(process.env.remoteLoginUrl, {
            method: "GET",
            mode: "*",
            headers: { Cookie: copyCookies },
        }).catch((err) => {
            console.log("axios err", next(err));
        });
        const loginStatus = axiosRes?.data ? axiosRes.data : "no data";
        console.log("axiosRes", loginStatus);
        if (loginStatus.login === 1) {
            //register remote user
            await registerRemoteUser(loginStatus.email, next);
            //if already registered, retrieve user data
            const apiKeys = await retrieveAPIKeysEmail(
                req,
                loginStatus.email,
                next
            );
            console.log("remote api keys", apiKeys);
            res.status(200).json(apiKeys);
        } else {
            res.status(401).json({ login: 0 });
        }
    } else {
        console.log("not logged in, no remote login");
        res.status(401).json({ login: 0 });
    }
});

export default router;
