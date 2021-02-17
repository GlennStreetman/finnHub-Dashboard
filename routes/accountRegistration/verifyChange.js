const express = require('express');
const router =  express.Router();
const format = require('pg-format');
const db = process.env.live === '1' ? 
    require("../../db/databaseLive.js") :  
    require("../../db/databaseLocalPG.js") ;

//verifys a change to email address.
router.get("/verifyChange", (req, res, next) => {
    let verifyID = format('%L', req.query['id'])
    let verifyUpdate = `
    UPDATE users
    SET email = (SELECT newemail FROM newEmail WHERE queryString = ${verifyID} limit 1) 
    , confirmemail = 1
    WHERE id = (SELECT userID FROM newEmail WHERE queryString = ${verifyID} limit 1)
    ;
    DELETE FROM newEmail 
    WHERE userID IN (SELECT userID FROM newEmail WHERE queryString = ${verifyID})
    ;
    `
    // console.log(verifyUpdate)
    db.query(verifyUpdate, (err, rows) => {
    if (err) {
        // console.log("FAIL", err)
        res.statusCode = 401
        res.json({message: "Could not update email address."});
    } else if (rows[0].rowCount === 1) {
        // console.log("SUCCESS:", rows[0].rowCount)
        // console.log('email verified')
        res.statusCode = 302 //redirect is auto 302
        res.redirect('/')
    } else {
        // console.log("FAIL")
        res.statusCode = 406
        res.json({message: "Failed to verify new email address."});
    }
    })
});

module.exports = router;