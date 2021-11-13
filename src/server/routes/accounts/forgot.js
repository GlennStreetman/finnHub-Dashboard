import express from 'express';
import format from 'pg-format';
import postgresDB from "./../../db/databaseLocalPG.js"
import mGun from 'mailgun-js'
import cryptoRandomString from 'crypto-random-string';

const router = express.Router();

router.get("/forgot", (req, res, next) => {
    console.log('RESET REQUEST RECEIVED', req.query)
    const API_KEY = process.env.API_KEY || 1;
    const DOMAIN = process.env.DOMAIN_KEY || 1;
    const mailgun = new mGun({ apiKey: API_KEY, domain: DOMAIN });
    const URL = process.env.URL
    const db = postgresDB;
    // console.log("reseting password")
    let loginName = format('%L', req.query["loginText"]);
    let forgotQuery = `SELECT id, loginName, email FROM users WHERE email = ${loginName}`;
    
    db.query(forgotQuery, (err, rows) => {
        if (err) {
            console.log("Error finding email /forgot: ", err)
            res.status(400).json({message: "Email not found"});
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
                    console.log("Error on password reset /forgot:", err)
                    res.status(400).json({message: "Error during password reset. Check email"});
                } else if (rows.rowCount !== 1) {
                    // console.log("Failed to update user info, try restarting reset process.");
                    res.status(401).json({message: "Email not found."});
                } else {
                    mailgun.messages().send(mailgunData, (error, body) => {
                    if (err) {
                        res.status(400).json({message: "Problem sending email message."});
                    } else {
                        res.status(200).json({message: "Please check email for recovery instructions."});
                    }
                    });
                }
            })
        } else {
            // console.log("failed email check");
            res.status(401).json({message: "Email not found."});
        }
    });
});

export default router