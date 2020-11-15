let express = require('express');
let router =  express.Router();
const db = require("../../db/databaseSQL3.js");

// middleware specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
});

router.get("*", (req, res) => {
  //Do not return APP until login in complete? Come back to this later.
  console.log(req.session.login)
  const URLLogin = process.env.live ? `build/index.html` : `public/index.html`
  const URLApp = process.env.live ? `build/index.html` : `public/index.html`
  req.session.login === true ? res.sendFile(__dirname, URLLogin) : res.sendFile(__dirname, URLApp)
});

router.get("/accountData", (req, res) => {
  thisRequest = req.query;
  newQuery = `SELECT loginName, email, apiKey, webHook FROM users WHERE id =${req.session.uID}`;
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
  let updateField = req.body.field;
  let newValue = req.body.newValue;
  let updateQuery = `UPDATE users SET ${updateField}='${newValue}' WHERE id=${req.session.uID}`;
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

router.post("/dashboard", (req, res) => {
  let dashBoardName = req.body.dashBoardName;
  let globalStockList = JSON.stringify(req.body.globalStockList);
  let widgetList = JSON.stringify(req.body.widgetList);
  let menuList = JSON.stringify(req.body.menuList);
  let userName = req.session.userName;
  let getUserIdQuery = "SELECT id FROM users WHERE loginName ='" + userName + "'";

  const getUserID = () => {
    return new Promise((resolve, reject)=> {
      db.get(getUserIdQuery, [], (err, rows) => {
        if (err) {
          reject('Could not find user ID.');
        } else {
          resolve(rows.id)
        };      
      })
    })
  }

  const saveDashBoardSetup = (data) => {
    return new Promise((resolve, reject)=> {
      let saveDashBoardSetupQuery = `
      INSERT OR REPLACE INTO dashBoard 
      (userID, dashBoardName, globalStockList, widgetList) 
      VALUES 
      (${data}, '${dashBoardName}','${globalStockList}','${widgetList}')`;

      db.all(saveDashBoardSetupQuery, [], (err, rows) => {
        if (err) {
          reject('Failed to save dashboard', err)
        } else {
          resolve(data)
        }
      })
    })
  }

  const checkUserStatus = (data) => {
    return new Promise((resolve, reject)=> {
      let saveMenuSetupQuery = `INSERT OR REPLACE INTO menuSetup 
        (userID, menuList, defaultMenu)
        VALUES (${data}, '${menuList}', '${dashBoardName}')`;
      
      db.all(saveMenuSetupQuery, [], (err, rows) => {
        if (err) {
          reject("Failed to save menu setup", err);
        } else {
          res.json("Save Complete");
        }
      });
    })
  }

  getUserID()
  .then(data => {
    console.log(data)
    return saveDashBoardSetup(data)
  }).then(data => {
    console.log(data)
    return checkUserStatus(data)
  }).then(data => {
    console.log(data)
    res.json('true')
  }).catch(err => res.json(err))

});

router.get("/deleteSavedDashboard", (req, res) => {
  let uId = req.session.uID;
  let thisRequest = req.query;
  let deleteSQL = `DELETE FROM dashBoard WHERE userID=${uId} AND id=${thisRequest["dashID"]}`;
  // console.log(uId, deleteSQL);
  db.exec(deleteSQL, (err, rows) => {
    if (err) {
      res.json("Failed to delete");
    } else {
    res.json("success");
    }
  });
});

module.exports = router;
