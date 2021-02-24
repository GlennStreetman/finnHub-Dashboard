const express = require('express');
const router =  express.Router();
const format = require('pg-format');
const db = process.env.live === '1' ? 
    require("../../db/databaseLive.js") :  
    require("../../db/databaseLocalPG.js") ;
const md5 = require("md5");

//redirect to /newPW from /reset route.
//username and resesion reset flag should be set by redirect.
router.get("/newPW", (req, res, next) => {
    // console.log("/newPW:", req.session)
    const newPW = format('%L', req.query.newPassword)
    const userName = format('%L', req.session.userName)
    const reset = format('%L', req.session.reset)
    // console.log(newPW, userName, reset)
    const newQuery = `
    UPDATE users 
    SET password = '${md5(newPW)}', passwordconfirmed = false, resetpasswordlink = '' 
    WHERE loginName = ${userName} 
        AND 1 = ${reset} 
        AND resetpasswordlink = 'testpasswordlink' 
        AND passwordconfirmed = true` ;
    console.log(newQuery);
    db.query(newQuery, (err, rows) => {
    if (err) {
        console.log("ERROR /newPW: ", err)
        res.status(400).json({message: "Could not reset password"});
    } else if (rows.rowCount === 1) {
        // console.log("password reset");
        res.status(200).json({message: "true"});
    } else {

        res.status(401).json({message: "Password not updated, restart process."});
    }
    });
});

module.exports = router;