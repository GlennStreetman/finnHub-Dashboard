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
    SET password = '${md5(newPW)}', passwordconfirmed = 0 
    WHERE loginName = ${userName} AND '1' = ${reset} AND resetPassword = '1'` ;
    console.log(newQuery);
    db.query(newQuery, (err, rows) => {
    if (err) {
        console.log(err)
        res.statusCode = 401
        res.json({message: "Could not reset password"});
    } else if (rows.rowCount === 1) {
        // console.log("password reset");
        res.statusCode = 200
        res.json({message: "true"});
    } else {
        // console.log("password not updated");
        res.statusCode = 406
        res.json({message: "Password not updated, restart process."});
    }
    });
});

module.exports = router;