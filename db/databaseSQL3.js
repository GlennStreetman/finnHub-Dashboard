//verbose returns extra messages for debugging.
const sqlite3 = require("sqlite3").verbose();
const md5 = require("md5");

const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database. err param null if everything goes correctly.
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      `CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            loginname text UNIQUE, 
            email text UNIQUE, 
            password text,
            secretquestion text,
            secretanswer text,
            apikey text,
            webhook text,
            confirmemail text,
            resetpassword text
            )`,

      (err) => {
        if (err) {
          // Table already created
        } else {
          // Table just created, creating some rows
          console.log("inserting rows");
          var insert = "INSERT INTO users (loginName, email, password, secretQuestion, secretAnswer, apiKey, webHook, confirmEmail, resetPassword) VALUES (?,?,?,?,?,?,?,?,?)";
          db.run(insert, [
            "admin",
            "glennstreetmanadmin@gmail.com",
            md5("admin"),
            "This is my secret question",
            md5("answer"),
            "testAPIKey",
            "testWebhookKey",
            "1",
            "0",
          ]);
          db.run(insert, [
            "guest",
            "glennstreetman@gmail.com",
            md5("guest456!"),
            "This is my secret question",
            md5("answer"),
            "testAPIKey",
            "testWebhookKey",
            "1",
            "0",

          ]);
          db.run(`CREATE TABLE dashBoard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userid INTEGER, 
            dashboardname text,
            globalstocklist text,
            widgetlist text,
            CONSTRAINT dashboardid UNIQUE (userid, dashboardname) 
            )`);
          db.run(`CREATE TABLE menuSetup (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userid INTEGER, 
            menulist text,
            defaultmenu text,
            CONSTRAINT onePerUser UNIQUE (userid)
            )`);
        }
      }
    );
  }
});

module.exports = db;
