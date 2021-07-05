import path, { dirname } from "path";
import dbLive from './databaseLive.js';
import devDB from "./databaseLocalPG.js";
import { fileURLToPath } from 'url';
import fs from 'fs'
const db = process.env.live === "1" ? dbLive : devDB;
const __dirname = dirname(fileURLToPath(import.meta.url));

const runUpdateQuery = async (updateQuery: string, version: number | string) => {
    return new Promise(async (resolve, reject): Promise<any> => {
        db.query(updateQuery, (err, rows) => {
            if (err) {
                console.log("Problem setting up Postgres database ", err)
                resolve(false)
            } else {
                console.log(`Version: ${version} of postgres schema setup complete`)
                resolve(true)
            }
        })
    })
}

const getVersion = async () => {
    return new Promise(async (resolve, reject): Promise<any> => {
        console.log('getting version')
        const versionQuery = 'SELECT version FROM VERSION'
        db.query(versionQuery, async (err, rows) => {
            let version: string
            if (err) {
                console.log("No version table found, setting up postgres database.");
                const createDB1 = fs.readFileSync(path.resolve(__dirname, `postgresVersions/1.0_create`))
                const buildDB = createDB1.toString()
                console.log(buildDB)
                await runUpdateQuery(buildDB, '1.0')
                version = '1.0'
            } else if (rows.rowCount === 0) {
                const createDB1 = fs.readFileSync(path.resolve(__dirname, `postgresVersions/1.0_create`))
                const updateQuery = createDB1.toString()
                console.log(updateQuery)
                await runUpdateQuery(updateQuery, '1.0')
                version = '1.0'
            } else {
                console.log(`getVersion ${rows.rows[0].version}`, rows.rows)
                version = typeof (rows.rows[0].version) === 'string' ? rows.rows[0].version : 0
            }
            console.log('version found', version)
            resolve(version)
        });

    })
};

const versionControl = async function () {
    console.log('!checking postgres version:', process.env.version)
    const envVersionString: string = process.env.version ? process.env.version : '1.0'
    const envVersion: number = parseFloat(envVersionString)
    const dbVersionString = await getVersion()
    const dbVersion = typeof dbVersionString === 'string' ? parseFloat(dbVersionString) : false
    console.log('HERE', envVersion, dbVersion, dbVersionString)
    if (envVersion && envVersion === dbVersion) { //base case: DB up to date.
        console.log(`database schema up to date. v${dbVersion}`)
        return true
    } else if (envVersion && typeof dbVersion === 'number' && envVersion > dbVersion) { //env version greater, run update recursive
        console.log(`Upgrading postgres schema from v${dbVersion}`)
        const getUpdateQuery = fs.readFileSync(path.resolve(__dirname, `postgresVersions/${dbVersionString}_upgrade.sql`))
        const updateQuery = getUpdateQuery.toString()
        console.log(updateQuery)
        await runUpdateQuery(updateQuery, `${dbVersion}_upgrade`)
        return versionControl()
    } else if (envVersion && typeof dbVersion === 'number' && envVersion < dbVersion) { //env version lesser, run downgrade recursive
        console.log(`Downgrading postgres schema from v${dbVersion}`)
        const getUpdateQuery = fs.readFileSync(path.resolve(__dirname, `postgresVersions/${dbVersionString}_downgrade.sql`))
        const updateQuery = getUpdateQuery.toString()
        console.log(updateQuery)
        await runUpdateQuery(updateQuery, `${dbVersion}_upgrade`)
        return versionControl()
    } else {
        return false
    }
}

export { versionControl }