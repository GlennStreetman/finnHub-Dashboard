import express from "express";
import format from "pg-format";
import sha512 from "./../../db/sha512.js";
import postgresDB from "../../db/databaseLocalPG.js";

const router = express.Router();

router.get("/login", (req, res, next) => {
    const db = postgresDB;
    let loginText = format("%L", req.query["loginText"]);
    let pwText = format("%L", req.query["pwText"]);
    let loginQuery = `SELECT id, loginname, apikey, apialias, ratelimit, emailconfirmed, exchangelist, defaultexchange, widgetsetup
        FROM users WHERE loginName =${loginText} 
        AND password = '${sha512(pwText)}'`;
    console.log("loginQuery", loginQuery);
    let info = {
        //return object.
        key: "",
        login: 0,
        ratelimit: 25,
        response: "",
        exchangelist: "",
        defaultexchange: "",
        widgetsetup: "",
    };

    db.query(loginQuery, (err, rows) => {
        const login = rows.rows[0];
        if (err) {
            console.log("LOGIN ERROR:", err);
            res.status(400).json({ message: "Login error" });
        } else if (rows.rowCount === 1 && login.emailconfirmed === true) {
            info["key"] = login.apikey;
            info["apiAlias"] = login.apialias;
            info["ratelimit"] = login.ratelimit;
            info["login"] = 1;
            info["response"] = "success";
            info["exchangelist"] = rows.rows[0]["exchangelist"];
            info["defaultexchange"] = rows.rows[0]["defaultexchange"];
            info["widgetsetup"] = rows.rows[0]["widgetsetup"];
            req.session.uID = login.id;
            req.session.userName = rows.rows[0]["loginname"];
            req.session.login = true;
            res.status(200).json(info);
        } else if (rows.rowCount === 1 && login.emailconfirmed !== true) {
            // console.log("Email not confirmed")
            res.status(401).json({ message: `Email not confirmed. Please check email for confirmation message.` });
        } else {
            // console.log("Login and password did not match.")
            res.status(401).json({ message: `Login and Password did not match.` });
        }
    });
});

router.get("/logOut", (req, res, next) => {
    if (req.session) {
        req.session.login = false;
    }
    res.status(200).json({ message: "Logged Out" });
});

export default router;
