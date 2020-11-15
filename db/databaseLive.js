console.log("loading live server postgres connection")
const { Client } = require('pg')

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

db.connect();

module.exports = db;


//client.end();

//add below talbes to live db.
// `CREATE TABLE users (
//   id SERIAL PRIMARY KEY,
//   loginName text UNIQUE, 
//   email text UNIQUE, 
//   password text,
//   secretQuestion text,
//   secretAnswer text,
//   apiKey text,
//   webHook text,
//   confirmEmail text,
//   resetPassword text
//   )`

// `CREATE TABLE dashBoard (
//   id SERIAL PRIMARY KEY,
//   userID INTEGER, 
//   dashBoardName text,
//   globalStockList text,
//   widgetList text,
//   CONSTRAINT dashBoardID UNIQUE (userid, dashBoardName) `

// `CREATE TABLE menuSetup (
//   id SERIAL PRIMARY KEY,
//   userID INTEGER, 
//   menuList text,
//   defaultMenu text,
//   CONSTRAINT onePerUser UNIQUE (userID)
//   )`

