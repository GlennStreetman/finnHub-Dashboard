const express = require('express');
const router =  express.Router();
const format = require('pg-format');
const cryptoRandomString = require('crypto-random-string');
const URL = process.env.live === '1' ? `https://finn-dash.herokuapp.com` : `http://localhost:5000`
const md5 = require("md5");
const db = process.env.live === '1' ? require("../../db/databaseLive.js") :  require("../../db/databaseLocalPG.js") ;
 
//mailgun config data, needs to be set to be imported if not available in process.env
const API_KEY = process.env.API_KEY || 1;
const DOMAIN = process.env.DOMAIN_KEY || 1;
// console.log(API_KEY, DOMAIN)

const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

// middleware specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
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
    resetPassword) 
  VALUES (
    ${loginText},
    '${md5(pwText)}',
    ${emailText},
    ${secretQuestion},
    '${md5(secretAnswer)}', 
    '${validateKey}', 
    '0')
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
        res.json('true')
      }).catch(err => res.json(err))
    } else {
      res.json("Enter a valid email address");
    }
});

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
      res.json("Could not validate email address.");
      // console.log(verifyUpdate)
    } else {
      console.log('email verified')
      res.redirect('/')
    }
  })
});

router.get("/login", (req, res) => {
  let loginText = format('%L', req.query["loginText"])
  let pwText = format('%L', req.query["pwText"])
  let loginQuery = `SELECT id, loginname, apikey, confirmemail 
              FROM users WHERE loginName =${loginText} 
              AND password = '${md5(pwText)}'`;
  let info = { key: "", login: 0 };
  console.log(loginQuery)
  db.query(loginQuery, (err, rows) => {
    let login = rows.rows[0]
    // console.log(login)
    if (err) {
      res.json("false");
    } else if (rows.rowCount === 1 && login.confirmemail === '1') {
      info["key"] = login.apikey;
      info["login"] = 1;
      info["response"] = 'success';
      req.session.uID = login.id;
      req.session.userName = rows.rows[0]['loginname'];
      req.session.login = true
      console.log(req.session)
      res.json(info);
    } else if (rows.rowCount === 1 && login.confirmemail !== '1') {
      // console.log(login)
      info["response"] = 'Please confirm your email address.';
      res.json(info)
    } else {
      info["response"] = "Login/Password did not match."
      res.json(info)
    }
  });
});

router.get("/forgot", (req, res) => {
  console.log("reseting password")
  let loginName = format('%L', req.query["loginText"]);
  let forgotQuery = `SELECT id, loginName, email FROM users WHERE email = ${loginName}`;
  console.log(forgotQuery)
  db.query(forgotQuery, (err, rows) => {
    let login = rows.rows[0]
    // console.log(login)
    if (err) {
      res.json("Email not found");
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
          res.json("Error during password reset..");
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
      res.json("Please check email for recovery instructions.");
    } else {
      console.log("failed email");
      res.json("Email not found.");
    }
  });
});

router.get("/reset", (req, res) => {
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
      res.json("Error during password reset process.");
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
//find secret question
router.get("/findSecret", (req, res) => {
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
      res.json("Error during password reset process.");
    } else if (secretQuestion !== undefined) {
      let data = {
        question: secretQuestion,
        user: userID
      }
      console.log(`Secret Questions returned for user ${userID}.`)
      res.json(data)
    } else {
      console.log(`secret question query problem.`)
      res.json('Problem with reset password link.')
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
      res.json("Secret question did not match.");
    } else {
      // console.log(rows);
      if (rows !== undefined) {
        // console.log("reset ready");
        // req.session.userName = rows.rows[0]['loginname']
        req.session.reset = 1;
        res.json("true");
      } else {
        // console.log("reset NOT ready");
        res.json("false");
      }
    }
  });
});

router.get("/newPW", (req, res) => {
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
      res.json("Could not reset password");
    } else {
      console.log("password reset");
      res.json("true");
    }
  });
});

module.exports = router;



