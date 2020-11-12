let express = require('express');
let router =  express.Router();

const cryptoRandomString = require('crypto-random-string');
const URL = process.env.live ? `https://finn-dash.herokuapp.com/` : `https://localhost:5000`
const md5 = require("md5");
const db = require("./../database.js");

//mailgun config data, needs to be set to be imported if not available in process.env
const API_KEY = process.env.API_KEY || 1;
const DOMAIN = process.env.DOMAIN_KEY || 1;
console.log(API_KEY, DOMAIN)

const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

// middleware specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
});

router.post("/register", (req, res) => {
  let loginText = req.body.loginText;
  let pwText = req.body.pwText;
  let emailText = req.body.emailText;
  let secretQuestion = req.body.secretQuestion;
  let secretAnswer = req.body.secretAnswer;
  const validateKey = cryptoRandomString({ length: 32 });
  const checkUser = "SELECT loginName FROM user WHERE loginName ='" + loginText + "'";
  const checkEmail = "SELECT email FROM user WHERE email ='" + emailText + "'";
  const createUser = `
  INSERT INTO user (
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
    "0")`;

  function emailIsValid(email) {
    return /\S+@\S+\.\S+/.test(email);
  };

  const checkUserStatus = () => {
    return new Promise((resolve, reject)=> {
      db.get(checkUser, (err, rows) => {
        if (err) {
          console.log("user check error");
          reject("User check error");
        } else if (rows !== undefined) {
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
      db.get(checkEmail, (err, rows) => {
        if (err) {
        reject("email check error");
        } else if (rows !== undefined) {
        reject("Email already taken");
        } else { 
          resolve("Email Available.")
        }
      })
    })
  }

  const createNewUser = (() => {
    return new Promise((resolve, reject) => {
      db.exec(createUser, (rows) => {
        if (rows === null) {
          const data = {
              from: 'Glenn Streetman <glennstreetman@gmail.com>',
              to: 'glennstreetman@gmail.com',
              subject: 'finnHub Verify Email',
              text: `Please visit the following link to verify your email address and login to finnDash: ${URL}/verify?id=${validateKey}`
          };
          mailgun.messages().send(data, (error, body) => {
              if (error) {
              console.log(error)
              } else {
              console.log(body);
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
        console.log(data)
        return checkEmailUnique()
      }).then(data => {
        console.log(data)
        return createNewUser()
      }).then(data => {
        console.log(data)
        res.json('true')
      }).catch(err => res.json(err))
    } else {
      res.json("Enter a valid email address");
    }
});

router.get("/verify", (req, res) => {
  verifyID = req.query['id']
  verifyUpdate = `
  UPDATE user
  SET confirmEmail = 1
  WHERE confirmEmail = '${verifyID}'
  `
  db.exec(verifyUpdate, (err) => {
    if (err) {
      res.json("Could not validate email address.");
      console.log(verifyUpdate)
    } else {
      console.log('email verified')
      res.redirect('/')
    }
  })
});

router.get("/login", (req, res) => {
  thisRequest = req.query; //.query contains all query string parameters.
  newQuery = "SELECT id, apiKey, confirmEmail FROM user WHERE loginName ='" + thisRequest["loginText"] + "' AND password = '" + md5(thisRequest["pwText"]) + "'";
  let info = { key: "", login: 0 };
  db.get(newQuery, (err, rows) => {
    if (err) {
      res.json("false");
    } else if (rows !== undefined && rows.confirmEmail === '1') {
      info["key"] = rows.apiKey;
      info["login"] = 1;
      info["response"] = 'success';
      req.session.uID = rows.id;
      req.session.userName = thisRequest["loginText"];
      req.session.login = true
      res.json(info);
    } else if (rows !== undefined && rows.confirmEmail !== '1') {
      info["response"] = 'Please confirm your email address.';
      res.json(info)
    } else {
      info["response"] = "Login/Password did not match."
      res.json(info)
    }
  });
});

router.get("/forgot", (req, res) => {
  thisRequest = req.query; //.query contains all query string parameters.
  forgotQuery = "SELECT id, loginName, email FROM user WHERE email ='" + thisRequest["loginText"] + "'";
  db.get(forgotQuery, (err, rows) => {
    if (err) {
      res.json("Email not found");
    } else if (rows !== undefined) {
      const validateKey = cryptoRandomString({ length: 32 })
      const data = {
        from: 'Glenn Streetman <glennstreetman@gmail.com>',
        to: `${rows.email}`,
        subject: 'finnDash Credential Recovery',
        text: `Your finnDash login name is: ${rows.loginName}.  
              If you need to recover your password please visit the following link: ${URL}/reset?id=${validateKey}&user=${rows.loginName} `
      };
      const resetPasswordCode = `
      UPDATE user 
      SET resetPassword = '${validateKey}'
      WHERE id = ${rows.id} 
      `
      db.exec(resetPasswordCode, (err, rows) => {
        if (err) {
          console.log(resetPasswordCode)
          console.log("error on password reset")
          res.json("Error during password reset..");
        } else {
          console.log('password reset flag set')
          // res.redirect('/')
        }
      })
      console.log(data)
      mailgun.messages().send(data, (error, body) => {
        if (err) {
          console.log(error)
        } else {
          console.log(body);
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
  UPDATE user
  SET resetPassword = 1
  WHERE resetPassword = '${verifyID}'
  `
  db.exec(verifyUpdate, (err) => {
    if (err) {
      res.json("Error during password reset process.");
      console.log(verifyUpdate)
    } else {
      console.log('passowrd reset flag set.')
      res.redirect(`/?reset=1&user=${user}`)
    }
  })
});

router.get("/findSecret", (req, res) => {
  userID = req.query['user']
  verifyUpdate = `
  SELECT secretQuestion
  FROM user
  WHERE loginName = '${userID}' AND resetPassword = 1
  `
  // console.log(verifyUpdate)
  db.get(verifyUpdate, (err, rows) => {
    if (err) {
      res.json("Error during password reset process.");
    } else if (rows) {
      console.log(rows.secretQuestion)
      data = {
        question: rows.secretQuestion,
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
  console.log(thisRequest)
  newQuery = "SELECT id FROM user WHERE secretAnswer ='" + md5(thisRequest["loginText"]) + "' AND loginName = '" + thisRequest["user"] + "'";
  console.log(newQuery);
  req.session.userName = thisRequest.user
  db.get(newQuery, [], (err, rows) => {
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
  newQuery = `UPDATE user SET password = '${md5(thisRequest.newPassword)}' WHERE loginName = '${req.session.userName}' AND 1 = ${req.session.reset}`;
  console.log(newQuery);
  db.exec(newQuery, (err, rows) => {
    if (err) {
      res.json("Could not reset password");
    } else {
      console.log("success");
      res.json("true");
    }
  });
});

module.exports = router;



