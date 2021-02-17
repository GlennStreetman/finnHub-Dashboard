const express = require('express');
const router =  express.Router();
const format = require('pg-format');
const db = process.env.live === '1' ? 
    require("../../db/databaseLive.js") :  
    require("../../db/databaseLocalPG.js") ;

//verifys emails address. Part of registration process
router.get("/verifyEmail", (req, res, next) => {
    let verifyID = format('%L', req.query['id'])
    let verifyUpdate = `
    UPDATE users
    SET confirmEmail = 1
    WHERE confirmEmail = ${verifyID}
    `
    // console.log(verifyUpdate)
    db.query(verifyUpdate, (err, rows) => {
        // console.log(rows)
        if (err) {
        res.statusCode = 401
        res.json({message: "Could not validate email address."});
    } else if (rows.rowCount === 1) {
        console.log('email verified')
        res.statusCode = 302
        res.redirect('/')
    } else {
        res.statusCode = 406
        res.json({message: "Failed to verify new email address."});
    }
    })
});

module.exports = router;