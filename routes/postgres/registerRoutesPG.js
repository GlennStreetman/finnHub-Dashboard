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
// console.log(API_KEY, DOMAIN)

const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

// middleware specific to this router
router.use(function timeLog (req, res, next) {
  // console.log('Time: ', Date.now())
  next()
});

router.post("/register", (req, res) => {
  const loginText = format('%L', req.body.loginText);
  const pwText = format('%L', req.body.pwText);
  const emailText = format('%L', req.body.emailText);
  const secretQuestion = format('%L', req.body.secretQuestion);
  const secretAnswer = format('%L', req.body.secretAnswer);
  console.log(loginText, pwText, emailText, secretQuestion, secretAnswer)
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
    defaultexchange
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
    'US')
    RETURNING *`;

  function emailIsValid(email) {
    return /\S+@\S+\.\S+/.test(email);
  };

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
      console.log("creating user:")
      console.log(createUser)
      db.query(createUser, (err, res) => {
        console.log(res)
        if (res !== undefined) {
          console.log(req.body.emailText)
          const data = {
              from: 'Glenn Streetman <glennstreetman@gmail.com>',
              to: req.body.emailText,
              subject: 'finnHub Verify Email',
              text: `Please visit the following link to verify your email address and login to finnDash: ${URL}/verify?id=${validateKey}`
          };
          console.log(data)
          mailgun.messages().send(data, (error) => {
              if (error) {
              console.log(error)
              } else {
              // console.log(body);
              console.log("email sent")
              }
          });
          resolve("true");
          } else {
            reject("failed to register");
          }
      });
    })
  })
  
    if (emailIsValid(emailText) === true) {
      checkUserStatus()
      .then(data => {
        // console.log(data)
        return checkEmailUnique()
      }).then(data => {
        // console.log(data)
        return createNewUser()
      }).then(data => {
        // console.log(data)
        res.json({message: 'new user created'})
      }).catch(err => res.json(err))
    } else {
      res.json({message: "Enter a valid email address"});
    }
});

//verifys emails address.
router.get("/verify", (req, res) => {
  let verifyID = format('%L', req.query['id'])
  let verifyUpdate = `
  UPDATE users
  SET confirmEmail = 1
  WHERE confirmEmail = ${verifyID}
  `
  console.log(verifyUpdate)
  db.query(verifyUpdate, (err) => {
    if (err) {
      res.json({message: "Could not validate email address."});
      // console.log(verifyUpdate)
    } else {
      console.log('email verified')
      res.redirect('/')
    }
  })
});

 //checks answer to secret question.
router.get("/secretQuestion", (req, res) => {
  console.log('------secretquestion-------')
  console.log(req.session)
  let loginText = md5(req.query["loginText"])
  // let loginName = format('%L', req.query["user"])
  
  let newQuery = `
    SELECT id, loginname 
    FROM users 
    WHERE secretAnswer = '${loginText}' AND 
    loginName = '${req.session.userName}'`;
  console.log(newQuery);
  console.log(req.query['user'])
  db.query(newQuery, [], (err, rows) => {
    if (err) {
      res.json({message: "Secret question did not match."});
    } else {
      if (rows !== undefined) {

        req.session.reset = 1;
        res.json({message: "correct"});
      } else {

        res.json({message: "Secret question answer did not match."});
      }
    }
  });
});

//verifys an email address. Used by both Manage Account screen and upon registering a new account.
router.get("/verifyChange", (req, res) => {
  let verifyID = format('%L', req.query['id'])
  let verifyUpdate = `
    UPDATE users
    SET email = (SELECT newEmail FROM newEmail WHERE queryString = ${verifyID} limit 1)
    WHERE id = (SELECT userID FROM newEmail WHERE queryString = ${verifyID} limit 1)
    ;
    DELETE FROM newEmail 
    WHERE userID  = (SELECT userID FROM newEmail WHERE queryString = ${verifyID})
  `
  console.log(verifyUpdate)
  db.query(verifyUpdate, (err) => {
    if (err) {
      res.json({message: "Could not update email address."});
      // console.log(verifyUpdate)
    } else {
      console.log('email verified')
      res.redirect('/')
    }
  })
});

module.exports = router;



