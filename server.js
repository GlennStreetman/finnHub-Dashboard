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
  thisRequest = req.query;
  newQuery = "SELECT id, apiKey FROM user WHERE loginName ='" + thisRequest["loginText"] + "' AND password = '" + md5(thisRequest["pwText"]) + "'";
  let myKey = { key: "", login: 0 };
  db.all(newQuery, [], (err, rows) => {
    if (err) {
      res.json(myKey);
    }
    rows.forEach((row) => {
      myKey["key"] = row.apiKey;
      myKey["login"] = 1;
      // console.log(myKey);
      req.session.uID = row.id;
    });

    req.session.userName = thisRequest["loginText"];
    // console.log(req.session.userName);
    res.json(myKey);
  });
});

app.get("/dashboard", (req, res) => {
  getUserIdQuery = "SELECT id, dashBoardName, globalStockList, widgetList FROM dashBoard WHERE userID ='" + req.session.uID + "'";
  let userID = -1;
  db.all(getUserIdQuery, [], (err, rows) => {
    if (err) {
      res.json(userID);
    }
    res.json(rows);
  });
});

// trackedStocks, widgetList, dashName;
app.post("/dashboard", (req, res) => {
  let dashBoardName = req.body.dashBoardName;
  let globalStockList = JSON.stringify(req.body.globalStockList);
  console.log(req.body.globalStockList);
  console.log(typeof globalStockList);
  let widgetList = JSON.stringify(req.body.widgetList);
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

      // console.log(userID);
      let saveDashBoardSetupQuery = `INSERT INTO dashBoard (userID, dashBoardName, globalStockList, widgetList) VALUES (${userID}, '${dashBoardName}','${globalStockList}','${widgetList}')`;
      console.log(saveDashBoardSetupQuery);
      db.all(saveDashBoardSetupQuery, [], (err, rows) => {
        if (err) {
          res.json("Failed to save", err);
          //return negative 1 if error
        } else {
          res.json("complete");
        }
      });
    }
  });
});

app.get("/deleteSavedDashboard", (req, res) => {
  let uId = req.session.uID;
  let thisRequest = req.query;
  let deleteSQL = `DELETE FROM dashBoard WHERE userID=${uId} AND id=${thisRequest["dashID"]}`;
  console.log(uId, deleteSQL);
  db.exec(deleteSQL, (err, rows) => {
    if (err) {
      res.json("Failed to delete");
    }
    res.json("success");
  });
});

app.listen(port, function () {
  console.log("Listening to http://localhost:" + port);
});

// Default response for any other request
app.use(function (req, res) {
  res.status(404);
});
