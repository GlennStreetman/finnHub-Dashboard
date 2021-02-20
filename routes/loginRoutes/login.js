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
    console.log(loginQuery)
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
        console.log("LOGIN:", login, rows.rowCount)
        if (err) {
            res.statusCode = 401
            res.json({message: "Login error"});
        } else if (rows.rowCount === 1 && login.emailconfirmed === true) {
            res.statusCode = 200
            console.log("USER:", login.loginname, "succesfuly logged in.")
            info["key"] = login.apikey;
            info['ratelimit'] = login.ratelimit
            info["login"] = 1;
            info["response"] = 'success';
            info["exchangelist"] = rows.rows[0]['exchangelist']
            info["defaultexchange"] = rows.rows[0]['defaultexchange']
            req.session.uID = login.id;
            req.session.userName = rows.rows[0]['loginname'];
            req.session.login = true

            res.json(info);
        } else if (rows.rowCount === 1 && login.emailconfirmed !== true) {
            res.statusCode = 406
            console.log("Email not confirmed")
            info["response"] = 'Please confirm your email address.';
            res.json(info)
        } else {
            // console.log("TESTS:", rows.rowCount, login.emailconfirmed)
            res.statusCode = 406
            console.log("Login and password did not match.")
            info["response"] = "Login/Password did not match."
            res.json(info)
        }
    });
});

router.get("/logOut", (req, res, next) => {
    req.session.login = false;
    // console.log(req.session.userName, req.session.login);
    res.json("true");
});


module.exports = router;