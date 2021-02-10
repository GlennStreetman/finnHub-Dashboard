
const express = require("express");
const router = express.Router();
const format = require("pg-format");
const cryptoRandomString = require("crypto-random-string");
const db = process.env.live === "1" ? require("../../db/databaseLive.js") : require("../../db/databaseLocalPG.js");
const URL = process.env.live === '1' ? `https://finn-dash.herokuapp.com` : `http://localhost:5000`

//mailgun config data, needs to be set to be imported if not available in process.env
const API_KEY = process.env.API_KEY || 1;
const DOMAIN = process.env.DOMAIN_KEY || 1;
const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });

function emailIsValid(email) {
  return /\S+@\S+\.\S+/.test(email);
};

router.use(function timeLog(req, res, next) {
  // console.log("Time: ", new Date());
  next();
});

router.get("*", (req, res) => {
  //Disabled, can be updated in future to redirect if not logged in.
  // console.log("New: " + req.session.login);
  const URLLogin = process.env.live ? `build/index.html` : `public/index.html`;
  const URLApp = process.env.live ? `build/index.html` : `public/index.html`;
  req.session.login === true ? res.sendFile(__dirname, URLLogin) : res.sendFile(__dirname, URLApp);
});

router.get("/accountData", (req, res) => {
  // thisRequest = req.query;
  if (req.session.login === true) {
    let accountDataQuery = `SELECT loginName, email, apiKey, webHook, ratelimit FROM users WHERE id =$1`;
    let queryValues = [req.session.uID];
    let resultSet = {};
    db.query(accountDataQuery, queryValues, (err, rows) => {
      let result = rows.rows[0];
      // console.log(result)
      if (err) {
        res.json({message: "Could not retrieve user data"});
      } else {
        resultSet["userData"] = result;
        // console.log(resultSet)
        console.log("account data retrieved");
        res.json(resultSet);
      }
    });
  } else {res.json({message: "Not logged in."})}
});

router.post("/accountData", (req, res) => {
  console.log(req.body);
  if (req.session.login === true) {  
    
    if (req.body.field !== "email") {
    //NOT EMAIL
      console.log("updating account data");
    let updateField = req.body.field;
    let newValue = req.body.newValue;
    // console.log(updateField, newValue)
    let updateQuery = format("UPDATE users SET %I = %L WHERE id=%L", updateField, newValue, req.session.uID);
    console.log(updateQuery);
    // let queryValues = [updateField, newValue, req.session.uID]
    db.query(updateQuery, (err) => {
      if (err) {
        res.json({message: `Failed to update ${updateField}`});
      } else {
        res.json({
          message: `${updateField} updated`,
          data: newValue,
      });
      }
    });
    } else {
    //EMAIL
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
          res.json({message: `Problem updating email.`});
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
              res.json({message: "Failed to send verification email"});
            } else {
              res.json({message: "Please check email to verify change."});
            }
          });
        }
      });
    } else {res.json({message: `email not valid`})}}
  } else {res.json({message: "Not logged in."})}
});

router.get("/dashboard", (req, res) => {
  
  if (req.session.login === true) { 
    let getSavedDashBoards = `
      SELECT id, dashBoardName, globalStockList, widgetList 
      FROM dashBoard 
      WHERE userID =${req.session.uID}`;
    let getMenuSetup = `
      SELECT menuList, defaultMenu 
      FROM menuSetup 
      WHERE userID =${req.session.uID}`;
    
    let resultSet = {};
    db.query(getSavedDashBoards, (err, rows) => {
      if (err) {
        console.log(err)
        res.json({message: "Failed to retrieve dashboards"});
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
  } else {res.json({message: "Not logged in."})}
});

router.post("/dashboard", (req, res) => {
  
  if (req.session.login === true) {  
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
        console.log(saveDashBoardSetupQuery)
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
            res.json({message: "Save Complete"});
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
        res.json({message: "true"});
      })
      .catch((err) => res.json(err));
  } else {res.json({message: "Not logged in."})}
});

router.get("/deleteSavedDashboard", (req, res) => {
  
  if (req.session.login === true) {  
    let uId = req.session["uID"];
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
    // console.log(deleteSQL);
    // console.log(uId, deleteSQL);
    const deleteDashboard = () => {
      console.log("deleting dashboard");
      return new Promise((resolve, reject) => {
        db.query(deleteSQL, (err, rows) => {
          if (err) {
            reject("failed to delete dashboard", err);
          } else {
            console.log("dashboard deleted");
            resolve("dashboard deleted");
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
        res.json({message: "success"});
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
  } else {res.json({message: "Not logged in."})}
});

module.exports = router;