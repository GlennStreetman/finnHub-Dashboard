let express = require('express');
let router =  express.Router();

const cryptoRandomString = require('crypto-random-string');
const URL = process.env.live ? `https://finn-dash.herokuapp.com` : `http://localhost:5000`
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
  const loginText = req.body.loginText;
  const pwText = req.body.pwText;
  const emailText = req.body.emailText;
  const secretQuestion = req.body.secretQuestion;
  const secretAnswer = req.body.secretAnswer;
  const validateKey = cryptoRandomString({ length: 32 });
  const checkUser = "SELECT loginName FROM users WHERE loginName ='" + loginText + "'";
  const checkEmail = "SELECT email FROM users WHERE email ='" + emailText + "'";
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
    '${loginText}',
    '${md5(pwText)}',
    '${emailText}',
    '${secretQuestion}',
    '${md5(secretAnswer)}', 
    '${validateKey}', 
    '0')`;

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
      // console.log(createUser)
      db.query(createUser, (err, res) => {
        // console.log(res)
        if (res.rowCount === 1) {
          const data = {
              from: 'Glenn Streetman <glennstreetman@gmail.com>',
              to: emailText,
              subject: 'finnHub Verify Email',
              text: `Please visit the following link to verify your email address and login to finnDash: ${URL}/verify?id=${validateKey}`
          };
          mailgun.messages().send(data, (error, body) => {
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
  verifyID = req.query['id']
  verifyUpdate = `
  UPDATE users
  SET confirmEmail = 1
  WHERE confirmEmail = '${verifyID}'
  `
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
  thisRequest = req.query; //.query contains all query string parameters.
  newQuery = `SELECT id, apikey, confirmemail 
              FROM users WHERE loginName ='${thisRequest["loginText"]}' 
              AND password = '${md5(thisRequest["pwText"])}'`;
  let info = { key: "", login: 0 };
  // console.log(newQuery)
  db.query(newQuery, (err, rows) => {
    let login = rows.rows[0]
    // console.log(login)
    if (err) {
      res.json("false");
    } else if (rows.rowCount === 1 && login.confirmemail === '1') {
      info["key"] = login.apikey;
      info["login"] = 1;
      info["response"] = 'success';
      req.session.uID = login.id;
      req.session.userName = thisRequest["loginText"];
      req.session.login = true
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
  thisRequest = req.query; //.query contains all query string parameters.
  forgotQuery = "SELECT id, loginName, email FROM users WHERE email ='" + thisRequest["loginText"] + "'";
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
  verifyID = req.query['id']
  user = req.query['user']
  verifyUpdate = `
  UPDATE users
  SET resetPassword = 1
  WHERE resetPassword = '${verifyID}'
  `
  db.query(verifyUpdate, (err) => {
    if (err) {
      res.json("Error during password reset process.");
      // console.log(verifyUpdate)
    } else {
      console.log('passowrd reset flag set.')
      res.redirect(`/?reset=1&users=${user}`)
    }
  })
});

router.get("/findSecret", (req, res) => {
  userID = req.query['user']
  verifyUpdate = `
  SELECT secretQuestion
  FROM users
  WHERE loginName = '${userID}' AND resetPassword = '1'
  `
  // console.log(verifyUpdate)
  db.query(verifyUpdate, (err, rows) => {
    secretQuestion = rows.rows[0].secretquestion
    if (err) {
      res.json("Error during password reset process.");
    } else if (secretQuestion !== undefined) {
      data = {
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
  thisRequest = req.query; //.query contains all query string parameters.
  // console.log(thisRequest)
  newQuery = "SELECT id FROM users WHERE secretAnswer ='" + md5(thisRequest["loginText"]) + "' AND loginName = '" + thisRequest["user"] + "'";
  // console.log(newQuery);
  req.session.userName = thisRequest.user
  db.query(newQuery, [], (err, rows) => {
    if (err) {
      res.json("Secret question did not match.");
    } else {
      // console.log(rows);
      if (rows !== undefined) {
        // console.log("reset ready");
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
  thisRequest = req.query; //.query contains all query string parameters.
  newQuery = `UPDATE users SET password = '${md5(thisRequest.newPassword)}', resetpassword = 0 WHERE loginName = '${req.session.userName}' AND 1 = ${req.session.reset}`;
  // console.log(newQuery);
  db.query(newQuery, (err, rows) => {
    if (err) {
      res.json("Could not reset password");
    } else {
      console.log("password reset");
      res.json("true");
    }
  });
});

module.exports = router;



