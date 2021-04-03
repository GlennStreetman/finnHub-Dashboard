import Client from 'pg';
import dotenv from 'dotenv';
dotenv.config();
// console.log("loading live server postgres connection")
const dbLive = new Client.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
// dbLive.connect();
export default dbLive;
//remember to setup env variables to connect
//https://node-postgres.com/features/connecting#environment-variables
//# sourceMappingURL=databaseLive.js.map