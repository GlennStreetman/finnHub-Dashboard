const express = require("express");
const path = require("path");
const port = process.env.NODE_ENV || 5000;
const md5 = require("md5");
const db = require("./database.js");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const bodyParser = require("body-parser");

// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const axios = require("axios");
const app = express();

// let UserSessions = {};
let fileStoreOptions = {};
//build required in order to render react. Always place after session definition.
app.use(cookieParser());
app.use(bodyParser.json()); // support json encoded bodies
// app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// app.use(express.json({ limit: "1mb" }));

app.use(
  session({
    store: new FileStore(fileStoreOptions),
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true },
  })
);
// app.use(express.static(path.join(__dirname, "/build")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/");
});

app.get("/login", (req, res) => {
  thisRequest = req.query; //.query contains all query string parameters.
  newQuery = "SELECT id, apiKey FROM user WHERE loginName ='" + thisRequest["loginText"] + "' AND password = '" + md5(thisRequest["pwText"]) + "'";
  let myKey = { key: "", login: 0 };
  db.all(newQuery, [], (err, rows) => {
    if (err) {
      res.json("invalid login");
    } else {
      rows.forEach((row) => {
        myKey["key"] = row.apiKey;
        myKey["login"] = 1;
        // console.log(myKey);
        req.session.uID = row.id;
      });

      req.session.userName = thisRequest["loginText"];
      // console.log(req.session.userName);
      res.json(myKey);
    }
  });
});

app.get("/forgot", (req, res) => {
  thisRequest = req.query; //.query contains all query string parameters.
  newQuery = "SELECT loginName, secretQuestion FROM user WHERE email ='" + thisRequest["loginText"] + "'";
  console.log(newQuery);
  let userName = {};
  db.get(newQuery, [], (err, rows) => {
    if (err) {
      res.json("Email not found");
    } else {
      console.log(rows);
      console.log(rows.length);
      if (rows !== undefined) {
        req.session.userName = rows.loginName;
        userName["user"] = rows.loginName;
        userName["question"] = rows.secretQuestion;
        res.json(userName);
      } else {
        console.log("failed email");
        res.json("false");
      }
    }
  });
});

app.get("/secretQuestion", (req, res) => {
  thisRequest = req.query; //.query contains all query string parameters.
  newQuery = "SELECT id FROM user WHERE secretAnswer ='" + md5(thisRequest["loginText"]) + "' AND loginName = '" + req.session.userName + "'";
  console.log(newQuery);
  let userName = {};
  db.get(newQuery, [], (err, rows) => {
    if (err) {
      res.json("Secret question did not match.");
    } else {
      console.log(rows);
      if (rows !== undefined) {
        console.log("reset ready");
        req.session.reset = 1;
        res.json("true");
      } else {
        console.log("reset NOT ready");
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
      res.json("updated");
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
  console.log("updating user info");

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

// app.get("setDefaultDashBoard", (req, res) => {
//   let uId = req.session.uID;
//   let thisRequest = req.query;
//   let updateSQL = `UPDATE menuSetup SET defaultMenu = `;
// });

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

app.listen(port, function () {
  // console.log("Listening to http://localhost:" + port);
});

// Default response for any other request
app.use(function (req, res) {
  res.status(404);
});
