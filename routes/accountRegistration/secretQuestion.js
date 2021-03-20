import express from 'express';
import dbLive from "./../../db/databaseLive.js"
import devDB from "./../../db/databaseLocalPG.js"
import md5 from 'md5';

const router =  express.Router();
const db = process.env.live === "1" ? dbLive : devDB;

//checks answer to secret question.
router.get("/secretQuestion", (req, res, next) => {
    const loginText = md5(req.query["loginText"])
    const user = req.query["user"]
    console.log(loginText, user)
    const newQuery = `
        SELECT id, loginname 
        FROM users 
        WHERE secretAnswer = '${loginText}' AND loginname = '${user}'
    `;
    // console.log("CHECK SECRET QUESTION", newQuery)

    db.query(newQuery, (err, rows) => {
    if (err) {
        console.log("ERROR SECRET QUESTION:", err)
        res.status(400).json({message: "Problem returning secret question."});
    } else {
        if (rows.rows[0] !== undefined) {
            // console.log("ROWS:", rows.rows[0])
            req.session.reset = 1; //used by new password route.
            req.session.userName = user
            console.log("Secret question success. :", req.session)
            res.status(200).json({message: "correct"});
        } else {
            res.status(401).json({message: "Secret question and answer did not match."});
        }
    }
    });
});

export default router