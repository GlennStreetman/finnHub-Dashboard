const express = require('express');
const router =  express.Router();
const format = require('pg-format');
const db = process.env.live === '1' ? 
    require("../../db/databaseLive.js") :  
    require("../../db/databaseLocalPG.js") ;

//verifys an email address. Used by both Manage Account screen and upon registering a new account.
router.get("/verifyChange", (req, res, next) => {
    let verifyID = format('%L', req.query['id'])
    let verifyUpdate = `
    UPDATE users
    SET email = (SELECT newEmail FROM newEmail WHERE queryString = ${verifyID} limit 1)
    WHERE id = (SELECT userID FROM newEmail WHERE queryString = ${verifyID} limit 1)
    ;
    DELETE FROM newEmail 
    WHERE userID  = (SELECT userID FROM newEmail WHERE queryString = ${verifyID})
    `
    console.log(verifyUpdate)
    db.query(verifyUpdate, (err) => {
    if (err) {
        res.json({message: "Could not update email address."});
        // console.log(verifyUpdate)
    } else {
        console.log('email verified')
        res.redirect('/')
    }
    })
});

module.exports = router;