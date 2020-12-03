// const { json } = require('body-parser');
const express = require("express");
const router = express.Router();
const format = require("pg-format");
const cryptoRandomString = require("crypto-random-string");
const db = process.env.live === "1" ? require("../../db/databaseLive.js") : require("../../db/databaseLocalPG.js");
const URL = process.env.live === '1' ? `https://finn-dash.herokuapp.com` : `http://localhost:5000`
// middleware specific to this router

//mailgun config data, needs to be set to be imported if not available in process.env
const API_KEY = process.env.API_KEY || 1;
const DOMAIN = process.env.DOMAIN_KEY || 1;
// console.log(API_KEY, DOMAIN)
const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });

function emailIsValid(email) {
  return /\S+@\S+\.\S+/.test(email);
};

router.use(function timeLog(req, res, next) {
  console.log("Time: ", new Date());
  next();
});

router.get("*", (req, res) => {
  //Do not return APP until login in complete? Come back to this later.
  console.log("New: " + req.session.login);
  const URLLogin = process.env.live ? `build/index.html` : `public/index.html`;
  const URLApp = process.env.live ? `build/index.html` : `public/index.html`;
  req.session.login === true ? res.sendFile(__dirname, URLLogin) : res.sendFile(__dirname, URLApp);
});

router.get("/accountData", (req, res) => {
  // thisRequest = req.query;
  let accountDataQuery = `SELECT loginName, email, apiKey, webHook FROM users WHERE id =$1`;
  let queryValues = [req.session.uID];
  // console.log(newQuery)
  let resultSet = {};
  db.query(accountDataQuery, queryValues, (err, rows) => {
    let result = rows.rows[0];
    // console.log(result)
    if (err) {
      res.json("Could not retrieve user data");
    } else {
      resultSet["userData"] = result;
      // console.log(resultSet)
      console.log("account data retrieved");
      res.json(resultSet);
    }
  });
});

router.post("/accountData", (req, res) => {
  console.log(req.body);
  if (req.body.field !== "email") {
    console.log("updating account data");
    let updateField = req.body.field;
    let newValue = req.body.newValue;
    // console.log(updateField, newValue)
    let updateQuery = format("UPDATE users SET %I = %L WHERE id=%L", updateField, newValue, req.session.uID);
    console.log(updateQuery);
    // let queryValues = [updateField, newValue, req.session.uID]
    db.query(updateQuery, (err) => {
      if (err) {
        res.json(`Failed to update ${updateField}`);
      } else {
        res.json(`Update complete`);
      }
    });
  } else {
    //update email
    if (emailIsValid(req.body.newValue) === true) {
      console.log("new email address");

      let newValue = format(req.body.newValue);
      let queryString = cryptoRandomString({ length: 32 });
      let updateQuery = `INSERT INTO newEmail (userId, newEmail, queryString)
        VALUES (${req.session.uID}, '${newValue}', '${queryString}')
        `;
      
      console.log(updateQuery);
      db.query(updateQuery, (err) => {
        if (err) {
          // console.log(err)
          res.json(`Problem updating email.`);
        } else {
          console.log(res);
          const data = {
            from: "Glenn Streetman <glennstreetman@gmail.com>",
            to: newValue,
            subject: "DO NOT REPLY: Verify Finnhub email change",
            text: `Please visit the following link to verify the change to your finnhub email address: ${URL}/verifyChange?id=${queryString}`,
          };
          //send email
          mailgun.messages().send(data, (error) => {
            if (error) {
              console.log(error);
              res.json("Failed to send verification email");
            } else {
              console.log("Please check email to verify change.");
            }
          });
        }
      });
    } else {res.json("email not valid")}}
});

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
      res.json("Could not update email address.");
      // console.log(verifyUpdate)
    } else {
      console.log('email verified')
      res.redirect('/')
    }
  })
});

router.get("/dashboard", (req, res) => {
  let getSavedDashBoards = `
    SELECT id, dashBoardName, globalStockList, widgetList 
    FROM dashBoard WHERE userID =${req.session.uID}`;
  let getMenuSetup = `
    SELECT menuList, defaultMenu 
    FROM menuSetup WHERE userID =${req.session.uID}`;
  // console.log(getSavedDashBoards)
  // console.log(getMenuSetup)

  let resultSet = {};

  db.query(getSavedDashBoards, (err, rows) => {
    if (err) {
      res.json("Failed to retrieve dashboards");
    } else {
      let result = rows.rows;
      console.log("dashboards retrieved");
      resultSet["savedDashBoards"] = result;
      db.query(getMenuSetup, (err, rows) => {
        console.log("menu setup retrieved");
        let result = rows.rows;
        resultSet["menuSetup"] = result;
        console.log("returning dashboard and menu data");
        // console.log(resultSet)
        res.json(resultSet);
      });
    }
  });
});

router.post("/dashboard", (req, res) => {
  console.log("--------post dashboard-------------")
  let dashBoardName = format("%L", req.body.dashBoardName);
  let globalStockList = format("%L", JSON.stringify(req.body.globalStockList));
  let widgetList = format("%L", JSON.stringify(req.body.widgetList));
  let menuList = format("%L", JSON.stringify(req.body.menuList));

  const saveDashBoardSetup = (userID) => {
    return new Promise((resolve, reject) => {
      let saveDashBoardSetupQuery = `
      INSERT INTO dashBoard 
      (userID, dashBoardName, globalStockList, widgetList) 
      VALUES (${userID}, ${dashBoardName},${globalStockList},${widgetList})
      ON CONFLICT (userID, dashboardname) 
      DO UPDATE SET globalstocklist = EXCLUDED.globalstocklist, widgetlist = EXCLUDED.widgetlist
      `;
      // console.log(saveDashBoardSetupQuery)
      db.query(saveDashBoardSetupQuery, (err, rows) => {
        if (err) {
          reject("Failed to save dashboard", err);
          console.log("Failed to save dashboard");
        } else {
          console.log("dashboard data updated.");
          resolve(userID);
        }
      });
    });
  };

  const updateMenuSetup = (data) => {
    return new Promise((resolve, reject) => {
      let saveMenuSetupQuery = `INSERT INTO menuSetup 
        (userID, menuList, defaultMenu)
        VALUES (${data}, ${menuList}, ${dashBoardName}) 
        ON CONFLICT (userID) 
        DO UPDATE SET menuList = EXCLUDED.menuList, defaultMenu = EXCLUDED.defaultMenu
        `;

      db.query(saveMenuSetupQuery, (err, rows) => {
        if (err) {
          reject("Failed to save menu setup", err);
        } else {
          res.json("Save Complete");
        }
      });
    });
  };

  saveDashBoardSetup(req.session.uID)
    .then((data) => {
      console.log(data);
      return updateMenuSetup(data);
    })
    .then((data) => {
      console.log(data);
      res.json("true");
    })
    .catch((err) => res.json(err));
});

router.get("/deleteSavedDashboard", (req, res) => {
  let uId = req.session["uID"];
  // console.log(req.session)
  let thisRequest = req.query;
  let deleteDash = format("%L", thisRequest["dashID"]);
  let deleteSQL = `DELETE FROM dashBoard WHERE userID=${uId} AND id=${deleteDash}`;
  let checkDefault = `
  SELECT dashboard.id 
  FROM menuSetup 
  LEFT JOIN dashboard ON dashboard.dashboardname = menuSetup.defaultMenu
  WHERE menuSetup.userID = ${uId}
  `;
  let updateDefault = `
    UPDATE menuSetup SET defaultMenu = (
      SELECT dashboardname
      FROM dashboard
      WHERE userid = ${uId} AND id = (SELECT min(id) FROM dashboard where userid=${uId})
    )
    WHERE userid = ${uId}`;
  console.log(deleteSQL);
  // console.log(uId, deleteSQL);
  const deleteDashboard = () => {
    console.log("deleting dashboard");
    return new Promise((resolve, reject) => {
      db.query(deleteSQL, (err, rows) => {
        if (err) {
          reject("failed to delete dashboard", err);
          // res.json("Failed to delete");
        } else {
          console.log("dashboard deleted");
          resolve("dashboard deleted");
          // res.json("success");
        }
      });
    });
  };
  //if default dashboard is deleted set default to oldest dashboard
  const checkDefaultMenu = () => {
    console.log("checking default");
    return new Promise((resolve, reject) => {
      db.query(checkDefault, (err, rows) => {
        if (err) {
          console.log("error on checking default dash");
          reject("Error on checking default dash");
        } else {
          console.log(rows.rows[0].id, deleteDash);
          rows.rows[0].defaultmenu === undefined ? resolve("success") : reject("Updating default not needed");
        }
      });
    });
  };

  const updateDefaultMenu = () => {
    console.log("reseting default");
    return new Promise((resolve, reject) => {
      db.query(updateDefault, (err, rows) => {
        if (err) {
          console.log("error reseting default");
          reject("Failed to reset default dasbboard");
        } else {
          resolve("success");
        }
      });
    });
  };

  deleteDashboard()
    .then((data) => {
      console.log(data);
      return checkDefaultMenu();
    })
    .then((data) => {
      console.log(data);
      return updateDefaultMenu();
    })
    .then((data) => {
      console.log(data);
      res.json("success");
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

router.get("/checkLogin", (req, res) => {
  let resData = { login: 0 };
  let uID = req.session["uID"];
  let apiKeysQuery = `
    SELECT apikey, webhook 
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

router.get("/logOut", (req, res) => {
  req.session.login = false;
  console.log(req.session.userName, req.session.login);
  res.json("true");
});

module.exports = router;
