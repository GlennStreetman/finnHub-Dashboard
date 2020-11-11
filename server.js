const express = require("express");

const URL = process.env.live ? `https://finn-dash.herokuapp.com/` : `https://localhost:5000`

const port = process.env.NODE_ENV || 5000;
const md5 = require("md5");
const db = require("./database.js");
const cookieParser = require("cookie-parser");
const cryptoRandomString = require('crypto-random-string');
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const bodyParser = require("body-parser");

//mailgun config data, needs to be set to be imported if not available in process.env
const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN_KEY;
const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

const app = express();
let fileStoreOptions = {};

if (process.env.live) {
  //enable below to run HTTP server. Used with Heroku
  path = require("path");
  app.listen(process.env.PORT || port, function () {
    console.log("Listening to http://localhost:" + port);
  })
  app.use(cookieParser());
  app.use(bodyParser.json()); // support json encoded bodies
  app.use(express.static(path.join(__dirname, 'build')));
  app.use(
    session({
      store: new FileStore(fileStoreOptions),
      secret: process.env.session_secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, sameSite: true },
    })
  );
} else {
  //used for local testing.  
  //enable below to run HTTPS server. Currently needed when running in dev environment.
  //see the below link for info on updating https info
  //https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
  var fs = require('fs')
  var https = require('https')
  path = require("path");
  https.createServer({
    pfx: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pfx')),
    passphrase: 'glennPSKey',
  }, app).listen(port, function () {
    console.log(`serving the direcotry @ https`)
  })
  app.use(cookieParser());
  app.use(bodyParser.json()); // support json encoded bodies
  app.use(express.static(path.join(__dirname, 'build')));
  app.use(
    session({
      store: new FileStore(fileStoreOptions),
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, sameSite: true },
    })
  );
}

app.get("*", (req, res) => {
  //do not return APP until login in complete.
  const URLLogin = process.env.live ? `build/index.html` : `public/index.html`
  const URLApp = process.env.live ? `build/index.html` : `public/index.html`
  req.session.login === true ? res.sendFile(__dirname, URLLogin) : res.sendFile(__dirname, URLApp)
});

function emailIsValid(email) {
  return /\S+@\S+\.\S+/.test(email);
}

app.post("/register", (req, res) => {
  let loginText = req.body.loginText;
  let pwText = req.body.pwText;
  let emailText = req.body.emailText;
  let secretQuestion = req.body.secretQuestion;
  let secretAnswer = req.body.secretAnswer;
  const validateKey = cryptoRandomString({ length: 32 })
  const checkUser = "SELECT loginName FROM user WHERE loginName ='" + loginText + "'";
  const checkEmail = "SELECT email FROM user WHERE email ='" + emailText + "'";
  const createUser = `INSERT INTO user (loginName, password, email, secretQuestion, secretAnswer, 
    confirmEmail, resetPassword) 
    VALUES ('${loginText}','${md5(pwText)}','${emailText}','${secretQuestion}','${md5(secretAnswer)}', '${validateKey}', "0")`;

  //nodes util api might be able to clean this up by using util.promisify.
  //this should get us out of a callback pyramid.

  if (emailIsValid(emailText) === true) {
    db.get(checkUser, (err, rows) => {
      if (err) {
        // console.log("user check error");
        res.json("User check error");
      } else if (rows !== undefined) {
        // console.log("user check error2");
        res.json("User Name Already Taken");
      } else {
        // console.log("user name not taken");
        db.get(checkEmail, (err, rows) => {
          // console.log(rows);
          if (err) {
            // console.log("email check error");
            failedCheck = 1;
            res.json("email check error");
          } else if (rows !== undefined) {
            res.json("Email already taken");
            failedCheck = 1;
          } else {
            // console.log("email not taken");
            db.exec(createUser, (rows) => {
              if (rows === null) {
                res.json("true");
                const data = {
                  from: 'Glenn Streetman <glennstreetman@gmail.com>',
                  to: 'glennstreetman@gmail.com',
                  subject: 'Test Mailgun Email',
                  text: `Please visit the following link to verify your email address and login to finnDash: ${URL}/verify?id=${validateKey}`
                };
                mailgun.messages().send(data, (error, body) => {
                  if (err) {
                    console.log(error)
                  } else {
                    console.log(body);
                    console.log("email sent")
                  }
                });
              } else {
                res.json("failed to register");
              }
            });
          }
        });
      }
    });
  } else {
    res.json("Enter a valid email address");
  }
});

app.get("/verify", (req, res) => {
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
})

app.get("/login", (req, res) => {
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

app.get("/forgot", (req, res) => {
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
  // console.log("done");
});

app.get("/reset", (req, res) => {
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
})

app.get("/findSecret", (req, res) => {
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
})

//checks answer to secret question.
app.get("/secretQuestion", (req, res) => {
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

app.get("/newPW", (req, res) => {
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

app.get("/accountData", (req, res) => {
  // console.log(req);
  thisRequest = req.query;
  newQuery = `SELECT loginName, email, apiKey, webHook FROM user WHERE id =${req.session.uID}`;
  // console.log(newQuery);
  resultSet = {};
  db.all(newQuery, [], (err, rows) => {
    if (err) {
      res.json("Could not retrieve user data");
    } else {
      resultSet["userData"] = rows;
      res.json(resultSet);
    }
  });
});

app.post("/accountData", (req, res) => {
  // console.log("updating user info");

  let updateField = req.body.field;
  let newValue = req.body.newValue;
  let updateQuery = `UPDATE user SET ${updateField}='${newValue}' WHERE id=${req.session.uID}`;
  db.all(updateQuery, [], (err, rows) => {
    if (err) {
      res.json(`Failed to update ${updateField}`);
    } else {
      res.json(`Update complete`);
    }
  });
});

app.get("/dashboard", (req, res) => {
  getSavedDashBoards = `SELECT id, dashBoardName, globalStockList, widgetList FROM dashBoard WHERE userID =${req.session.uID}`;
  getMenuSetup = `SELECT menuList, defaultMenu FROM menuSetup WHERE userID =${req.session.uID}`;
  resultSet = {};

  db.all(getSavedDashBoards, [], (err, rows) => {
    if (err) {
      res.json("Failed to retrieve dashboards");
    } else {
      resultSet["savedDashBoards"] = rows;
      db.all(getMenuSetup, [], (err, rows) => {
        resultSet["menuSetup"] = rows;
        res.json(resultSet);
      });
    }
  });
});

// trackedStocks, widgetList, dashName;
app.post("/dashboard", (req, res) => {
  let dashBoardName = req.body.dashBoardName;
  let globalStockList = JSON.stringify(req.body.globalStockList);
  // console.log(req.body.globalStockList);
  console.log(typeof globalStockList);
  let widgetList = JSON.stringify(req.body.widgetList);
  let menuList = JSON.stringify(req.body.menuList);
  let userName = req.session.userName;
  getUserIdQuery = "SELECT id FROM user WHERE loginName ='" + userName + "'";
  // console.log(getUserIdQuery);
  let userID = -1;
  db.all(getUserIdQuery, [], (err, rows) => {
    if (err) {
      res.json((userID = -1));
      //return negative 1 if error
    } else {
      // console.log("found it");
      rows.forEach((row) => {
        userID = row.id;
      });

      // if a duplicate userID/dashBoardName is detected the record is replaced.
      let saveDashBoardSetupQuery = `INSERT OR REPLACE INTO dashBoard (userID, dashBoardName, globalStockList, widgetList) 
      VALUES (${userID}, '${dashBoardName}','${globalStockList}','${widgetList}')`;

      let saveMenuSetup = `INSERT OR REPLACE INTO menuSetup (userID, menuList, defaultMenu)
        VALUES (${userID}, '${menuList}', '${dashBoardName}')`;

      db.all(saveDashBoardSetupQuery, [], (err, rows) => {
        if (err) {
          res.json("Failed to save dashboard", err);
          //return negative 1 if error
        } else {
          db.all(saveMenuSetup, [], (err, rows) => {
            if (err) {
              res.json("Failed to save menu setup", err);
              //return negative 1 if error
            } else {
              res.json("Save Complete");
            }
          });
        }
      });
    }
  });
});

app.get("/deleteSavedDashboard", (req, res) => {
  let uId = req.session.uID;
  let thisRequest = req.query;
  let deleteSQL = `DELETE FROM dashBoard WHERE userID=${uId} AND id=${thisRequest["dashID"]}`;
  // console.log(uId, deleteSQL);
  db.exec(deleteSQL, (err, rows) => {
    if (err) {
      res.json("Failed to delete");
    }
    res.json("success");
  });
});