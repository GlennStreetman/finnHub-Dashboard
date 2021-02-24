// const { json } = require('body-parser');
const express = require("express");
const router = express.Router();
const format = require('pg-format');
const md5 = require("md5");
const db = process.env.live === '1' ? 
require("../../db/databaseLive.js") :  
require("../../db/databaseLocalPG.js") ;
 
router.get("/login", (req, res, next) => {
    let loginText = format('%L', req.query["loginText"])
    let pwText = format('%L', req.query["pwText"])
    // console.log(pwText)
    let loginQuery = `SELECT id, loginname, apikey, ratelimit, emailconfirmed,exchangelist, defaultexchange
        FROM users WHERE loginName =${loginText} 
        AND password = '${md5(pwText)}'`;
    // console.log(loginQuery)
    let info = { //return object.
        key: "", 
        login: 0,
        ratelimit: 25,
        response: '',
        exchangelist: '',
        defaultexchange: '',
    };

    db.query(loginQuery, (err, rows) => {
        const login = rows.rows[0]
        // console.log("LOGIN:", login, rows.rowCount)
        if (err) {
            console.log("LOGIN ERROR:", err)
            res.status(400).json({message: "Login error"});
        } else if (rows.rowCount === 1 && login.emailconfirmed === true) {
            info["key"] = login.apikey;
            info['ratelimit'] = login.ratelimit
            info["login"] = 1;
            info["response"] = 'success';
            info["exchangelist"] = rows.rows[0]['exchangelist']
            info["defaultexchange"] = rows.rows[0]['defaultexchange']
            req.session.uID = login.id;
            req.session.userName = rows.rows[0]['loginname'];
            req.session.login = true
            res.status(200).json(info);
        } else if (rows.rowCount === 1 && login.emailconfirmed !== true) {
            console.log("Email not confirmed")
            res.status(401).json({message: `Email not confirmed. Please check email for confirmation message.`})
        } else {    
            console.log("Login and password did not match.")
            res.status(401).json({message: `Login and Password did not match.`})
        }
    });
}); 

router.get("/logOut", (req, res, next) => {
    console.log("LOGOUT: ", req.session.userName, req.session.login);
    if (req.session) {req.session.login = false}
    res.status(200).json({message: "Logged Out"});
});


module.exports = router;