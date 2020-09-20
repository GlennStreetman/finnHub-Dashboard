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
      `CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            loginName text UNIQUE, 
            email text, 
            password text,
            apiKey text,
            webHook text
            )`,

      (err) => {
        if (err) {
          // Table already created
        } else {
          // Table just created, creating some rows
          console.log("inserting rows");
          var insert = "INSERT INTO user (loginName, email, password, apiKey, webHook) VALUES (?,?,?,?,?)";
          db.run(insert, ["admin", "glennstreetman@gmail.com", md5("admin"), "bsuu7qv48v6qu589jlj0", "bss698f48v6u62sfqlog"]);
          db.run(insert, ["guest", "glennstreetman@gmail.com", md5("guest"), "bsuu7qv48v6qu589jlj0", "bss698f48v6u62sfqlog"]);
          db.run(`CREATE TABLE dashBoard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userID INTEGER, 
            dashBoardName text,
            globalStockList text,
            widgetList text
            )`);
        }
      }
    );
  }
});

module.exports = db;
