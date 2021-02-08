// const { json } = require('body-parser');
const express = require("express");
const router = express.Router();
const format = require('pg-format');
const md5 = require("md5");
const db = process.env.live === '1' ? 
  require("../../db/databaseLive.js") :  
  require("../../db/databaseLocalPG.js") ;

  router.use(function timeLog(req, res, next) {
    // console.log("Time: ", new Date());
    next();
  });

router.get("/login", (req, res) => {
    let loginText = format('%L', req.query["loginText"])
    let pwText = format('%L', req.query["pwText"])
    let loginQuery = `SELECT id, loginname, apikey, confirmemail,exchangelist, defaultexchange
                FROM users WHERE loginName =${loginText} 
                AND password = '${md5(pwText)}'`;
    let info = { key: "", login: 0 };
    // console.log(loginQuery)
    db.query(loginQuery, (err, rows) => {
        let login = rows.rows[0]
      // console.log(login)
        if (err) {
          res.json({message: "login error"});
        } else if (rows.rowCount === 1 && login.confirmemail === '1') {
          info["key"] = login.apikey;
          info["login"] = 1;
          info["response"] = 'success';
          info["exchangelist"] = rows.rows[0]['exchangelist']
          info["defaultexchange"] = rows.rows[0]['defaultexchange']
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

router.get("/logOut", (req, res) => {
    req.session.login = false;
    console.log(req.session.userName, req.session.login);
    res.json("true");
});

//checks login status when site is initialy loaded.
router.get("/checkLogin", (req, res) => {
  let resData = { login: 0 };
  let uID = req.session["uID"];
  let apiKeysQuery = `
    SELECT apikey, webhook, exchangelist, defaultexchange 
    FROM users
    WHERE id = ${uID}
    `;
  const retrieveAPIKeys = () => {
    console.log("getting APIKeys");
    console.log(req.session);

    return new Promise((resolve, reject) => {
      db.query(apiKeysQuery, (err, rows) => {
        if (err) {
          console.log("error retrieving apiKeys");
          reject(resData);
        } else {
          resData.apiKey = rows.rows[0].apikey;
          resData.exchangelist = rows.rows[0].exchangelist;
          resData.defaultexchange = rows.rows[0].defaultexchange;
          resData.login = 1;
          resolve(resData);
        }
      });
    });
  };

  if (req.session.login === true) {
    retrieveAPIKeys()
      .then((data) => {
        console.log("login data: ", data);
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  } else {
    console.log("not logged in");
    res.json({ login: 0 });
  }
});

module.exports = router;