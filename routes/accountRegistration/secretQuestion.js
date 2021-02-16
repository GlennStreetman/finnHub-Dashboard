const express = require('express');
const router =  express.Router();
const db = process.env.live === '1' ? 
    require("../../db/databaseLive.js") :  
    require("../../db/databaseLocalPG.js") ;
const md5 = require("md5");
//checks answer to secret question.
router.get("/secretQuestion", (req, res, next) => {
    console.log('------secretquestion-------')
    console.log(req.session)
    let loginText = md5(req.query["loginText"])
    // let loginName = format('%L', req.query["user"])
    
    let newQuery = `
    SELECT id, loginname 
    FROM users 
    WHERE secretAnswer = '${loginText}' AND 
    loginName = '${req.session.userName}'`;
    console.log(newQuery);
    console.log(req.query['user'])
    db.query(newQuery, [], (err, rows) => {
    if (err) {
        res.json({message: "Secret question did not match."});
    } else {
        if (rows !== undefined) {

        req.session.reset = 1;
        res.json({message: "correct"});
        } else {

        res.json({message: "Secret question answer did not match."});
        }
    }
    });
});

module.exports = router;