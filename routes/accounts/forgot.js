const express = require('express');
const router =  express.Router();
const format = require('pg-format');
const db = process.env.live === '1' ? 
    require("../../db/databaseLive.js") :  
    require("../../db/databaseLocalPG.js") ;
const cryptoRandomString = require('crypto-random-string');

//mailgun info
const API_KEY = process.env.API_KEY || 1;
const DOMAIN = process.env.DOMAIN_KEY || 1;
const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });
const URL = process.env.live === '1' ? `https://finn-dash.herokuapp.com` : `http://localhost:5000`

router.get("/forgot", (req, res, next) => {
    console.log("reseting password")
    let loginName = format('%L', req.query["loginText"]);
    let forgotQuery = `SELECT id, loginName, email FROM users WHERE email = ${loginName}`;
    
    db.query(forgotQuery, (err, rows) => {
        if (err) {
            console.log("Problem finding email /forgot")
            res.statusCode = 401
            res.json({message: "Email not found"});
        } else if (rows.rowCount === 1) {
            const login = rows.rows[0]
            const validateKey = cryptoRandomString({ length: 32 })
            const mailgunData = {
                from: 'Glenn Streetman <glennstreetman@gmail.com>',
                to: `${login.email}`,
                subject: 'finnDash Credential Recovery',
                text: `Your finnDash login name is: ${login.loginname}.  
                    If you need to recover your password please visit the following link: ${URL}/reset?id=${validateKey}&users=${login.loginname} `
            };
            const resetPasswordCode = `
                UPDATE users 
                SET resetpasswordlink = '${validateKey}'
                WHERE id = ${login.id} 
            `
            db.query(resetPasswordCode, (err, rows) => {
                if (err) {
                    console.log("Error on password reset /forgot")
                    res.statusCode = 401
                    res.json({message: "Error during password reset. Check email"});
                } else if (rows.rowCount !== 1) {
                    console.log("Failed to update user info, try restarting reset process.");
                    res.statusCode = 406
                    res.json({message: "Email not found."});
                } else {
                    mailgun.messages().send(mailgunData, (error, body) => {
                    if (err) {
                        console.log(error)
                        res.statusCode = 401
                        res.json({message: "Problem sending email message."});
                    } else {

                        res.statusCode = 200
                        res.json({message: "Please check email for recovery instructions."});
                    }
                    });
                }
            })
        } else {
            console.log("failed email check");
            res.statusCode = 406
            res.json({message: "Email not found."});
        }
    });
});

module.exports = router;