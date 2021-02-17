const express = require('express');
const router =  express.Router();
const format = require('pg-format');
const cryptoRandomString = require('crypto-random-string');
const URL = process.env.live === '1' ? `https://finn-dash.herokuapp.com` : `http://localhost:5000`
const md5 = require("md5");
const db = process.env.live === '1' ? 
  require("../../db/databaseLive.js") :  
  require("../../db/databaseLocalPG.js") ;
//mailgun config data, needs to be set to be imported if not available in process.env
const API_KEY = process.env.API_KEY || 1;
const DOMAIN = process.env.DOMAIN_KEY || 1;

const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

router.post("/register", (req, res) => {
    // console.log(req.body)
    const loginText = format('%L', req.body.loginText);
    const pwText = format('%L', req.body.pwText);
    const emailText = format('%L', req.body.emailText);
    const secretQuestion = format('%L', req.body.secretQuestion);
    const secretAnswer = format('%L', req.body.secretAnswer);
    // console.log(loginText, pwText, emailText, secretQuestion, secretAnswer)
    const validateKey = cryptoRandomString({ length: 32 });
    const checkUser = `SELECT loginName FROM users WHERE loginName = ${loginText}`;
    const checkEmail = `SELECT email FROM users WHERE email = ${emailText}`;
    const createUser = `
    INSERT INTO users (
        loginName, 
        password, 
        email, 
        secretQuestion, 
        secretAnswer, 
        confirmEmail, 
        resetPassword,
        exchangelist,
        defaultexchange,
        ratelimit
        ) 
    VALUES (
        ${loginText},
        '${md5(pwText)}',
        ${emailText},
        ${secretQuestion},
        '${md5(secretAnswer)}', 
        '${validateKey}', 
        '0',
        'US',
        'US',
        30)
        RETURNING *`;

    function emailIsValid(email) {
        return /\S+@\S+\.\S+/.test(email);
    };

    function validateInfo() {
        if (loginText.length >= 3 &&
            pwText.length >= 6 &&
            emailText.length >= 1 && //validated in next step.
            secretQuestion.length >= 8 &&
            secretAnswer.length >= 4
            ) {
                return true
            } else {
                return false
            }
    }

    const checkUserStatus = () => {
        return new Promise((resolve, reject)=> {
        db.query(checkUser, (err, rows) => {
            if (err) {
            console.log("user check error");
            reject("User check error");
            } else if (rows.rowCount !== 0) {
            console.log("User name already taken.");
            reject("User Name Already Taken");
            } else {
            resolve("User Name Available")
            }
        })
        })
    }

    const checkEmailUnique = () => {
        return new Promise((resolve,reject)=>{
        db.query(checkEmail, (err, rows) => {
            if (err) {
            reject("email check error");
            } else if (rows.rowCount !== 0) {
            reject("Email already taken");
            } else { 
            resolve("Email Available.")
            }
        })
        })
    }

    const createNewUser = (() => {
        return new Promise((resolve, reject) => {
        // console.log("creating user:")
        // console.log(createUser)
        db.query(createUser, (err, res) => {
            console.log(res)
            if (res !== undefined) {
            // console.log(req.body.emailText)
            const data = {
                from: 'Glenn Streetman <glennstreetman@gmail.com>',
                to: req.body.emailText,
                subject: 'finnHub Verify Email',
                text: `Please visit the following link to verify your email address and login to finnDash: ${URL}/verifyEmail?id=${validateKey}`
            };
            // console.log(data)
            if (req.body.emailText !== 'test@test.com') {
                mailgun.messages().send(data, (error) => {
                    if (error) {
                    console.log(error)
                    } else {
                    // console.log(body);
                    console.log("email sent")
                    }
                });
            }
            resolve("true");
            } else {
                reject("failed to register");
            }
        });
        })
    })
    
        if (emailIsValid(emailText) === true && validateInfo() === true) {
            checkUserStatus()
            .then(data => {
                // console.log(data)
                return checkEmailUnique()
            }).then(data => {
                // console.log(data)
                return createNewUser()
            }).then(data => {
                res.statusCode = 200
                res.json({message: 'new user created'})
            }).catch((err) => {
                res.json(err)
            })
        } else {
            res.statusCode = 406
            res.json({message: "Enter a valid email address & check other info."});
        }
});

module.exports = router;



