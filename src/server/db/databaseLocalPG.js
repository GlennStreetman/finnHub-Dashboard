import Client from 'pg'
import dotenv from 'dotenv';
import versionControl from "./databaseVersionControl.js"

dotenv.config()

let devDB = new Client.Client
({
    sslmode: 'disable',
    user: process.env.pguser ,
    host: process.env.pghost ,
    database: process.env.pgdatabase ,
    password: process.env.pgpassword ,
    port: process.env.pgport
})

export function connectPostgres(arg=false){
    console.log('Connecting to postgres server')
    devDB.connect()
        .then(() => {
            console.log("connected to development postgres server") 
            versionControl(devDB, arg)
        })
        .catch((err) => {
            console.log("ERROR ON PG LOGIN", err)
            devDB = new Client.Client()
            setTimeout(()=>{connectPostgres()}, 5000)
            return true
        })
}

export default devDB
