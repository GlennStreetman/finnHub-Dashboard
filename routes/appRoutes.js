let express = require('express');
let router =  express.Router();
const db = require("./../database.js");

// middleware specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
});

router.get("*", (req, res) => {
  //do not return APP until login in complete.
  console.log(req.session.login)
  const URLLogin = process.env.live ? `build/index.html` : `public/index.html`
  const URLApp = process.env.live ? `build/index.html` : `public/index.html`
  req.session.login === true ? res.sendFile(__dirname, URLLogin) : res.sendFile(__dirname, URLApp)
});

router.get("/accountData", (req, res) => {
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

router.post("/accountData", (req, res) => {
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

router.get("/dashboard", (req, res) => {
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
router.post("/dashboard", (req, res) => {
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

router.get("/deleteSavedDashboard", (req, res) => {
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

//---------------------------------
module.exports = router;
