console.log("loading development postgres connection")

const { Client } = require('pg')
// const fs = require('fs');
// console.log(process.env.pguser, process.env.pghost, process.env.pgdatabase, process.env.pgpassword, process.env.pgport)
const db = new Client({
    sslmode: 'disable',
    user: process.env.pguser ,
    host: process.env.pghost ,
    database: process.env.pgdatabase ,
    password: process.env.pgpassword ,
    port: process.env.pgport ,
})



// db.connect()
// .then(() => console.log("connected to developement postgres server"))
// .catch(err => console.log(err))

module.exports = db;

//remember to setup env variables to connect
//https://node-postgres.com/features/connecting#environment-variables