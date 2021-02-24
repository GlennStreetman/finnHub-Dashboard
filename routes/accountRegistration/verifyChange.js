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
    , emailconfirmed = true, confirmemaillink = ''
    WHERE id = (SELECT userID FROM newEmail WHERE queryString = ${verifyID} limit 1)
    ;
    DELETE FROM newEmail 
    WHERE userID IN (SELECT userID FROM newEmail WHERE queryString = ${verifyID})
    ;
    `
    // console.log(verifyUpdate)
    db.query(verifyUpdate, (err, rows) => {
    if (err) {
        console.log("FAILED verifyChange: ", err)
        res.status(400).json({message: "Could not update email address."});
    } else if (rows[0].rowCount === 1) {
        res.status(302).redirect('/')
    } else {
        res.status(401).json({message: "Failed to verify new email address."});
    }
    })
});

module.exports = router;