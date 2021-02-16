const express = require('express');
const router =  express.Router();
const format = require('pg-format');
const db = process.env.live === '1' ? 
    require("../../db/databaseLive.js") :  
    require("../../db/databaseLocalPG.js") ;

//verifys emails address.
router.get("/verifyEmail", (req, res, next) => {
    let verifyID = format('%L', req.query['id'])
    let verifyUpdate = `
    UPDATE users
    SET confirmEmail = 1
    WHERE confirmEmail = ${verifyID}
    `
    console.log(verifyUpdate)
    db.query(verifyUpdate, (err) => {
    if (err) {
        res.json({message: "Could not validate email address."});
        // console.log(verifyUpdate)
    } else {
        console.log('email verified')
        res.redirect('/')
    }
    })
});

module.exports = router;