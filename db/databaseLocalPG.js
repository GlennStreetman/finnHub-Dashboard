console.log("loading development postgres connection")

const { Client } = require('pg')
// const fs = require('fs');
const db = new Client({
    sslmode: 'disable',
    user: process.env.pguser ,
    host: process.env.pghost ,
    database: process.env.pgdatabase ,
    password: process.env.pgpassword ,
    port: process.env.pgport ,
})

// console.log(db)

db.connect()
.then(() => console.log("connected to developement postgres server"))
.catch(err => console.log(err))

module.exports = db;

//remember to setup env variables to connect
//https://node-postgres.com/features/connecting#environment-variables


// //add below talbes to local db.
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
//   CONSTRAINT dashBoardID UNIQUE (userid, dashBoardName)
//   ) `

// `CREATE TABLE menuSetup (
//   id SERIAL PRIMARY KEY,
//   userID INTEGER, 
//   menuList text,
//   defaultMenu text,
//   CONSTRAINT onePerUser UNIQUE (userID)
//   )`
