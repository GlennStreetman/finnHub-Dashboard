import express from 'express';
import appRootPath from 'app-root-path'
import fs from 'fs';
import format from "pg-format";
import xlsx from 'xlsx';
import Papa from 'papaparse'
import fetch from 'node-fetch';
import eg from 'express-graphql'

import dbLive from "../../db/databaseLive.js"
import devDB from "../../db/databaseLocalPG.js"


const db = process.env.live === "1" ? dbLive : devDB;

const router = express.Router();

const getMongoData = (reqObj) => {
    
    return new Promise((resolve) => {
        const getAPIData = `http://localhost:5000/qGraphQL?query=${reqObj.q}`
        // console.log(getAPIData)
        fetch(getAPIData)
        .then((r)=>r.json())
        .then(data=>{
            for (const x in data){
                // console.log(data[x])
                reqObj.data = data[x]
                resolve(reqObj)
            }})
    })
}

router.get('/runTemplate', async (req, res) => {
    //route accessable via APIKEY or Alias.
    // console.log(req.query.key, req.query.template)

    const apiKey = format('%L', req.query['key'])
    const findUser = `
        SELECT id
        FROM users
        WHERE apiKey = ${apiKey} OR apiAlias = ${apiKey}
    `

    const userRows = await db.query(findUser)
    const user = userRows?.rows?.[0]?.id
    // console.log('user', user)
    const workBookPath = `${appRootPath}/uploads/${user}/${req.query.template}`
    const tempPath = `${appRootPath}/uploads/${user}/temp/`
    const tempFile = `${appRootPath}/uploads/${user}/temp/${req.query.template}${Date.now()}.xlsx`

    const queryObj = {}

    const promiseList = []
    if (fs.existsSync(workBookPath)) { //if template exists
        let workbook = xlsx.readFile(workBookPath);
        const querySheet = workbook.Sheets['Query']
        const queryList = Papa.parse(xlsx.utils.sheet_to_csv(querySheet)).data
        for (const q in queryList) { //for each query in special query sheet.
            if (queryList[q][0]) {
                queryObj[queryList[q][0]] = {q: queryList[q][1]}
                promiseList.push(getMongoData({
                    n: queryList[q][0],
                    q: queryList[q][1],
                }))
            }
        }
        let promiseData
        await Promise.all(promiseList)
        .then((res) => {
            const dataObj = {keys: new Set()}
            for (const w in res){ //for each widget
                dataObj[res[w].n] =  {}
                const widgetD = res[w].data.widget
                for (const s of widgetD) { //for each security
                    //add data and update key SET.
                    dataObj.keys.add(s.security)
                    dataObj[res[w].n][s.security] =  s.data
                }
            }
            promiseData = dataObj
            
        })
        if (!fs.existsSync(tempPath)) {
            console.log(tempPath)
            fs.mkdir(tempPath, (err) => {
                if (err) {
                    return console.error(err);
                }
                console.log('Directory created successfully!');

            })
        }
        fs.copyFileSync(workBookPath, tempFile)
        workbook = xlsx.readFile(tempFile);
        console.log(workbook)
        // let sheetNames = workbook.SheetNames
        // sheetNames.splice(sheetNames.indexOf('Query'), 1)
        // workbook.SheetNames = sheetNames
        // console.log(workbook.SheetNames, workbook)
    }
})


export default router