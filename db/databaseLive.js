console.log("loading live server postgres connection")
const { Client } = require('pg')

const db = new Client({
  connectionString: process.env.DATABASE_URL
  // ssl: {
  //   rejectUnauthorized: false
  // }
})

db.connect();

module.exports = db;

//remember to setup env variables to connect
//https://node-postgres.com/features/connecting#environment-variables
