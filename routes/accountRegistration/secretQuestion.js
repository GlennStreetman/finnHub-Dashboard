const express = require('express');
const router =  express.Router();
const db = process.env.live === '1' ? 
    require("../../db/databaseLive.js") :  
    require("../../db/databaseLocalPG.js") ;
const md5 = require("md5");
//checks answer to secret question.
router.get("/secretQuestion", (req, res, next) => {
    let loginText = md5(req.query["loginText"])
    let user = req.query["user"]
    
    let newQuery = `
        SELECT id, loginname 
        FROM users 
        WHERE secretAnswer = '${loginText}' AND 
        loginname = '${user}'
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
            // console.log("UPDATED QUESTION:", req.session)
            res.status(200).json({message: "correct"});
        } else {
            res.status(401).json({message: "Secret question and answer did not match."});
        }
    }
    });
});

module.exports = router;