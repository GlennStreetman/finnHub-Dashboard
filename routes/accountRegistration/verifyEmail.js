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
    SET emailconfirmed = true, confirmemaillink = ''
    WHERE confirmemaillink = ${verifyID}
    `
    console.log(verifyUpdate)
    db.query(verifyUpdate, (err, rows) => {
        // console.log(rows)
    if (err) {
        console.log("ERROR verifyEMail: ", err)
        res.status(302).redirect('/?message=2');
    } else if (rows.rowCount === 1) {
        console.log('email verified')
        res.status(302).redirect('/?message=1')
    } else {
        res.status(302).redirect('/?message=2');
    }
    })
});

module.exports = router;