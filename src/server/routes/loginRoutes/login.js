import express from "express";
import format from "pg-format";
import sha512 from "./../../db/sha512.js";
import postgresDB from "../../db/databaseLocalPG.js";
const router = express.Router();

router.get("/login", (req, res, next) => {
    const db = postgresDB;
    let loginEmail = format("%L", req.query["email"]);
    let pwText = format("%L", req.query["pwText"]);
    let loginQuery = `SELECT id, email, apikey, apialias, ratelimit, emailconfirmed, exchangelist, defaultexchange, widgetsetup
        FROM users WHERE email =${loginEmail} 
        AND password = '${sha512(pwText)}'`;
    let info = {
        key: "",
        login: 0,
        ratelimit: 25,
        response: "",
        exchangelist: "",
        defaultexchange: "",
        widgetsetup: "",
    };
    db.query(loginQuery, (err, rows) => {
        try {
            const login = rows.rows[0];
            if (err) {
                console.log("LOGIN ERROR:", err);
                res.status(400).json({ message: "Login error" });
            } else if (rows.rowCount === 1 && login.emailconfirmed === true) {
                if (req.session === undefined) throw new Error("Request not associated with session.");
                info["key"] = login.apikey;
                info["apiAlias"] = login.apialias;
                info["ratelimit"] = login.ratelimit;
                info["login"] = 1;
                info["response"] = "success";
                info["exchangelist"] = rows.rows[0]["exchangelist"];
                info["defaultexchange"] = rows.rows[0]["defaultexchange"];
                info["widgetsetup"] = rows.rows[0]["widgetsetup"];
                req.session.uID = login.id;
                req.session.login = true;
                res.status(200).json(info);
            } else if (rows.rowCount === 1 && login.emailconfirmed !== true) {
                res.status(401).json({ message: `Email not confirmed. Please check email for confirmation message.` });
            } else {
                res.status(401).json({ message: `Login and Password did not match.` });
            }
        } catch (error) {
            next(error);
        }
    });
});
router.get("/logOut", (req, res, next) => {
    try {
        if (req.session === undefined) throw new Error("Request not associated with session.");
        req.session.login = false;
        res.status(200).json({ message: "Logged Out" });
    } catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=login.js.map
