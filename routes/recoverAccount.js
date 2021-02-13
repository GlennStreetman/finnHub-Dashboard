const express = require('express');
const router =  express.Router();
const format = require('pg-format');
const db = process.env.live === '1' ? 
  require("../db/databaseLive.js") :  
  require("../db/databaseLocalPG.js") ;
const cryptoRandomString = require('crypto-random-string');
const md5 = require("md5");

const API_KEY = process.env.API_KEY || 1;
const DOMAIN = process.env.DOMAIN_KEY || 1;
const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

router.use(function timeLog (req, res, next) {
  // console.log('Time: ', Date.now())
  next()
});

router.get("/forgot", (req, res, next) => {
    console.log("reseting password")
    let loginName = format('%L', req.query["loginText"]);
    let forgotQuery = `SELECT id, loginName, email FROM users WHERE email = ${loginName}`;
    console.log(forgotQuery)
    db.query(forgotQuery, (err, rows) => {
        let login = rows.rows[0]
      // console.log(login)
        if (err) {
        res.json({message: "Email not found"});
        } else if (login !== undefined) {
        const validateKey = cryptoRandomString({ length: 32 })
        const data = {
            from: 'Glenn Streetman <glennstreetman@gmail.com>',
            to: `${login.email}`,
            subject: 'finnDash Credential Recovery',
            text: `Your finnDash login name is: ${login.loginname}.  
                If you need to recover your password please visit the following link: ${URL}/reset?id=${validateKey}&users=${login.loginname} `
        };
        const resetPasswordCode = `
        UPDATE users 
        SET resetPassword = '${validateKey}'
        WHERE id = ${login.id} 
        `
        db.query(resetPasswordCode, (err, rows) => {
          if (err) {
            // console.log(resetPasswordCode)
            console.log("error on password reset")
            res.json({message: "Error during password reset.."});
          } else {
            console.log('password reset flag set')
            // res.redirect('/')
          }
        })
        // console.log(data)
        mailgun.messages().send(data, (error, body) => {
          if (err) {
            console.log(error)
          } else {
            // console.log(body);
            console.log("email sent")
          }
        });
        res.json({message: "Please check email for recovery instructions."});
      } else {
        console.log("failed email");
        res.json({message: "Email not found."});
      }
    });
  });

  //find secret question
  router.get("/findSecret", (req, res, next) => {
    console.log('-------findsecret-------')
    console.log(req.session)
    console.log(req.query)
    // req.session.userName = req.query['user']
    let userID = format('%L', req.query['user'])
    let verifyUpdate = `
    SELECT secretQuestion
    FROM users
    WHERE loginName = ${userID} AND resetPassword = '1'
    `
    // console.log(verifyUpdate)
    // console.log(req.session.userName)
    db.query(verifyUpdate, (err, rows) => {
      let secretQuestion = rows.rows[0].secretquestion
      if (err) {
        res.json({message: "Error during password reset process."});
      } else if (secretQuestion !== undefined) {
        let data = {
          question: secretQuestion,
          user: userID
        }
        console.log(`Secret Questions returned for user ${userID}.`)
        res.json(data)
      } else {
        console.log(`secret question query problem.`)
        res.json({message: 'Problem with reset password link.'})
      }
    })
  });

  router.get("/reset", (req, res, next) => {
    console.log('----reset-----')
    console.log(req.query)
    let verifyID = format('%L', req.query['id'])
    // let user = format('%L', req.query['users'])
    req.session.userName = req.query['users']
    let verifyUpdate = `
    UPDATE users
    SET resetPassword = 1
    WHERE resetPassword = ${verifyID}
    RETURNING *
    `
    console.log(verifyUpdate)
    db.query(verifyUpdate, (err, rows) => {
      if (err) {
        res.json({message: "Error during password reset process."});
        // console.log(verifyUpdate)
      } else if (rows.rowCount === 1) {
        // console.log(rows)
        console.log('password reset flag set.')
        console.log(req.session)
        res.redirect(`/?reset=1&users=${rows.rows[0].loginname}`)
      } else {
        console.log("failed to update reset flag")
        // console.log(rows)
        res.redirect('/')
      }
    })
  });

  router.get("/newPW", (req, res, next) => {
    console.log('----new PW --------')
    console.log(req.query)
    console.log(req.session)
    let newPW = format('%L', req.query.newPassword)
    let userName = format('%L', req.session.userName)
    let reset = format('%L', req.session.reset)
    console.log(newPW, userName, reset)
    let newQuery = `
      UPDATE users 
      SET password = '${md5(newPW)}', resetpassword = 0 
      WHERE loginName = ${userName} AND '1' = ${reset}`;
    console.log(newQuery);
    db.query(newQuery, (err) => {
      if (err) {
        res.json({message: "Could not reset password"});
      } else {
        console.log("password reset");
        res.json({message: "true"});
      }
    });
  });

  module.exports = router;