import path, { dirname } from "path";
// import { fileURLToPath } from 'url';
import fs from "fs";
// const __dirname = dirname(fileURLToPath(import.meta.url));

const runUpdateQuery = async (updateQuery, version, db) => {
    return new Promise(async (resolve, reject) => {
        db.query(updateQuery, (err, rows) => {
            if (err) {
                console.log("Problem setting up Postgres database ", err);
                resolve(false);
            } else {
                console.log(`Version: ${version} of postgres schema setup complete`);
                resolve(true);
            }
        });
    });
};

const getVersion = async (db) => {
    // const __dirname = dirname(fileURLToPath(import.meta.url));
    return new Promise(async (resolve, reject) => {
        // console.log('getting version')
        const versionQuery = "SELECT version FROM VERSION";
        db.query(versionQuery, async (err, rows) => {
            let version;
            if (err) {
                console.log("No version table found, setting up postgres database.");
                const createDB1 = fs.readFileSync(path.resolve(`./build/server/db/postgresVersions/1.0_create.sql`));
                const buildDB = createDB1.toString();
                console.log(buildDB);
                await runUpdateQuery(buildDB, "1.0", db);
                version = "1.0";
            } else if (rows.rowCount === 0) {
                const createDB1 = fs.readFileSync(path.resolve(`./build/server/db/postgresVersions/1.0_create.sql`));
                const updateQuery = createDB1.toString();
                console.log(updateQuery);
                await runUpdateQuery(updateQuery, "1.0", db);
                version = "1.0";
            } else {
                // console.log(`getVersion ${rows.rows[0].version}`, rows.rows);
                version = typeof rows.rows[0].version === "string" ? rows.rows[0].version : 0;
            }
            // console.log("version found", version);
            resolve(version);
        });
    });
};

const versionControl = async function (db, arg) {
    const envVersionString = process.env.version ? process.env.version : "1.0";
    const envVersion = parseFloat(envVersionString);
    const dbVersionString = await getVersion(db);
    const dbVersion = typeof dbVersionString === "string" ? parseFloat(dbVersionString) : false;
    if (envVersion && envVersion === dbVersion) {
        //base case: DB up to date.
        console.log(`database schema up to date. v${dbVersion}`);
        if (arg === true) {
            console.log("test mode flag true, exiting");
            process.exit(0);
        }
    } else if (envVersion && typeof dbVersion === "number" && envVersion > dbVersion) {
        //env version greater, run update recursive
        console.log(`Upgrading postgres schema from v${dbVersion}`);
        const getUpdateQuery = fs.readFileSync(path.resolve(`./build/server/db/postgresVersions/${dbVersionString}_upgrade.sql`));
        const updateQuery = getUpdateQuery.toString();
        console.log(updateQuery);
        await runUpdateQuery(updateQuery, `${dbVersion}_upgrade`, db);
        return versionControl(db);
    } else if (envVersion && typeof dbVersion === "number" && envVersion < dbVersion) {
        //env version lesser, run downgrade recursive
        console.log(`Downgrading postgres schema from v${dbVersion}`);
        const getUpdateQuery = fs.readFileSync(path.resolve(`./build/server/db/postgresVersions/${dbVersionString}_downgrade.sql`));
        const updateQuery = getUpdateQuery.toString();
        console.log(updateQuery);
        await runUpdateQuery(updateQuery, `${dbVersion}_upgrade`, db);
        return versionControl(db);
    } else {
        return false;
    }
};

export default versionControl;
