import Client from "pg";
import dotenv from "dotenv";
import versionControl from "./databaseVersionControl.js";
import session from "express-session";
import pg from "pg";
import pgSimple from "connect-pg-simple";

dotenv.config();

let devDB = new Client.Client({
    sslmode: "disable",
    user: process.env.pguser,
    host: process.env.pghost,
    database: process.env.pgdatabase,
    password: process.env.pgpassword,
    port: process.env.pgport,
});

export function connectPostgres(arg = false, app = false) {
    devDB
        .connect()
        .then(() => {
            console.log("----Connected to Postgres----");
            versionControl(devDB, arg);

            if (app) {
                console.log("---Creating Session Pool---");
                var pgPool = new Client.Pool({
                    database: process.env.pgdatabase,
                    user: process.env.pguser,
                    password: process.env.pgpassword,
                    port: 5432,
                    ssl: false,
                    max: 20, // set pool max size to 20
                    idleTimeoutMillis: 1000, // close idle clients after 1 second
                    connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
                    maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
                });

                const pgSession = new pgSimple(session);
                app.use(
                    session({
                        // store: new FileStore(fileStoreOptions),
                        store: new pgSession({
                            pool: pgPool,
                        }),
                        secret: process.env.session_secret,
                        resave: false,
                        saveUninitialized: true,
                        cookie: { secure: false, sameSite: true },
                    })
                );
            }
        })
        .catch((err) => {
            console.log("ERROR ON PG LOGIN", err);
            devDB = new Client.Client();
            setTimeout(() => {
                connectPostgres();
            }, 5000);
            return true;
        });
}

export default devDB;
