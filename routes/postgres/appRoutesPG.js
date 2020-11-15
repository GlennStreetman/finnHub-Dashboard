let express = require('express');
let router =  express.Router();

const db = process.env.live === 1 ? require("../../db/databaseLive.js") :  require("../../db/databaseLocalPG.js") ;
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
  console.log(newQuery)
  resultSet = {};
  db.query(newQuery, (err, rows) => {
    result = rows.rows[0]
    console.log(result)
    if (err) {
      res.json("Could not retrieve user data");
    } else {
      resultSet["userData"] = result;
      console.log(resultSet)
      res.json(resultSet);
    }
  });
});

router.post("/accountData", (req, res) => {
  let updateField = req.body.field;
  let newValue = req.body.newValue;
  let updateQuery = `UPDATE users SET ${updateField}='${newValue}' WHERE id=${req.session.uID}`;
  db.query(updateQuery, (err, rows) => {
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
  console.log(getSavedDashBoards)
  console.log(getMenuSetup)
  
  resultSet = {};

  db.query(getSavedDashBoards, (err, rows) => {
    let result = rows.rows
    if (err) {
      res.json("Failed to retrieve dashboards");
    } else {
      console.log('dashboards retrieved')
      resultSet["savedDashBoards"] = result;
      db.query(getMenuSetup, (err, rows) => {
        console.log('menu setup retrieved')
        let result = rows.rows
        resultSet["menuSetup"] = result;
        console.log("returning dashboard and menu data")
        console.log(resultSet)
        res.json(resultSet);
      });
    }
  });
});
 
router.post("/dashboard", (req, res) => {
  console.log(req.body)
  let dashBoardName = req.body.dashBoardName;
  let globalStockList = JSON.stringify(req.body.globalStockList);
  let widgetList = JSON.stringify(req.body.widgetList);
  let menuList = JSON.stringify(req.body.menuList);
  let userName = req.session.userName;
  let getUserIdQuery = "SELECT id FROM users WHERE loginName ='" + userName + "'";
  
  const getUserID = () => {
    return new Promise((resolve, reject)=> {
      db.query(getUserIdQuery, (err, rows) => {
        data = rows.rows[0].id
        console.log('dashboard data')
        console.log(data)
        if (err) {
          reject('Could not find user ID.');
        } else {
          resolve(data)
        };      
      })
    })
  }

  const saveDashBoardSetup = (data) => {
    return new Promise((resolve, reject)=> {
      let saveDashBoardSetupQuery = `
      INSERT INTO dashBoard 
      (userID, dashBoardName, globalStockList, widgetList) 
      VALUES 
      (${data}, '${dashBoardName}','${globalStockList}','${widgetList}')
      ON CONFLICT (userID, dashboardname) 
      DO UPDATE SET globalstocklist = EXCLUDED.globalstocklist, widgetlist = EXCLUDED.widgetlist
      `;
      console.log(saveDashBoardSetupQuery)
      db.query(saveDashBoardSetupQuery, (err, rows) => {
        if (err) {
          reject('Failed to save dashboard', err)
        } else {
          console.log("dashboard data updated.")
          resolve(data)
        }
      })
    })
  }

  const updateMenuSetup = (data) => {
    return new Promise((resolve, reject)=> {
      let saveMenuSetupQuery = `INSERT INTO menuSetup 
        (userID, menuList, defaultMenu)
        VALUES (${data}, '${menuList}', '${dashBoardName}') 
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
    })
  }

  getUserID()
  .then(data => {
    console.log(data)
    return saveDashBoardSetup(data)
  }).then(data => {
    console.log(data)
    return updateMenuSetup(data)
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
  db.query(deleteSQL, (err, rows) => {
    if (err) {
      res.json("Failed to delete");
    } else {
    res.json("success");
    }
  });
});

module.exports = router;
