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
        res.statusCode = 401
        res.json({message: "Problem returning secret question."});
    } else {
        if (rows.rows[0] !== undefined) {
            // console.log("ROWS:", rows.rows[0])
            req.session.reset = 1; //used by new password route.
            req.session.userName = user
            res.statusCode = 200
            // console.log("UPDATED QUESTION:", req.session)
            res.json({message: "correct"});
        } else {
            res.statusCode = 406
            res.json({message: "Secret question answer did not match."});
        }
    }
    });
});

module.exports = router;