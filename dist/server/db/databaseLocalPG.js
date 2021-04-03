import Client from 'pg';
import dotenv from 'dotenv';
dotenv.config();
// console.log("PGDEV", process.env.pguser, process.env.pghost, process.env.pgdatabase, process.env.pgpassword, process.env.pgport)
const devDB = new Client.Client({
    sslmode: 'disable',
    user: process.env.pguser,
    host: process.env.pghost,
    database: process.env.pgdatabase,
    password: process.env.pgpassword,
    port: process.env.pgport
});
// devDB.connect()
// .then(() => console.log("connected to developement postgres server"))
// .catch(err => console.log(err))
export default devDB;
//remember to setup env variables to connect
//https://node-postgres.com/features/connecting#environment-variables
//# sourceMappingURL=databaseLocalPG.js.map