import express from 'express';
import appRootPath from 'app-root-path'
import fs from 'fs';
import format from "pg-format";

import xlsx from 'xlsx';
import Excel from 'exceljs';

import Papa from 'papaparse';
import fetch from 'node-fetch';

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

function getDataSlice(dataObj, queryString){
    //iterates through all dataObj keys to finds all matching slices 
    //return object {security(s): value(s)}
    // console.log('queryString', queryString)
    const returnObj = {}
    const queryStringList = queryString.split('.')
    const keys = dataObj.keys
    for (const s of keys){
        const val = dataObj?.[queryStringList[0]]?.[s]?.[queryStringList[1]]
        returnObj[s] = val
    }

    return returnObj
}

router.get('/runTemplate', async (req, res) => {
    //route accessable via APIKEY or Alias.
    //get user ID
    const apiKey = format('%L', req.query['key'])
    const findUser = `
        SELECT id
        FROM users
        WHERE apiKey = ${apiKey} OR apiAlias = ${apiKey}
    `
    //copy target template into temp folder
    const userRows = await db.query(findUser)
    const user = userRows?.rows?.[0]?.id
    const workBookPath = `${appRootPath}/uploads/${user}/${req.query.template}`
    const tempPath = `${appRootPath}/uploads/${user}/temp/`
    const tempFile = `${appRootPath}/uploads/${user}/temp/${req.query.template}${Date.now()}.xlsx`
    
    //read query worksheet and retrieve data from graphQL
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
        //build query object FROM query sheet.
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
        //make temp directory for user if it doesnt already exist.
        if (!fs.existsSync(tempPath)) {
            // console.log(tempPath)
            fs.mkdir(tempPath, (err) => {
                if (err) {
                    return console.error(err);
                }
                // console.log('Directory created successfully!');
            })
        }
        // console.log(promiseData)
        //read template, create data object, create temp file to be written to.
        const templateData = {} //to be
        fs.copyFileSync(workBookPath, tempFile)
        let wb = new Excel.Workbook()
        await wb.xlsx.readFile(workBookPath)
        wb.eachSheet((worksheet, sheetid)=>{
            if (worksheet.name !== 'Query') {
                templateData[worksheet.name] = {}
                worksheet.eachRow((row, rowNumber)=>{
                    const thisRow = {
                        data: {},
                        writeColumns: 0, //if zero skip in later steps. Used for inserting new rows if greater than 1.
                    }
                    for (const x in row.values) {
                        if (row.values[x].slice(0,2) === '&=') {
                            const searchStringRaw = row.values[x]
                            const searchString = searchStringRaw.slice(2, searchStringRaw.length)
                            if (searchString !== 'keys.keys') {
                                const dataObj = getDataSlice(promiseData, searchString)
                                console.log(Object.keys(dataObj).length)
                                if (Object.keys(dataObj).length > thisRow.writeColumns) {thisRow.writeColumns = Object.keys(dataObj).length}
                                thisRow.data[x] = dataObj
                            }
                            // thisRow.data[x] = JSON.stringify(row.values[x]).slice(3, JSON.stringify(row.values).length)
                        }
                    }
                    console.log('Row ' + rowNumber + ' : ', thisRow );
                    templateData[worksheet.name][rowNumber] = thisRow
                    // console.log(templateData[worksheet.name][rowNumber])
                })
            }
        })
        console.log(templateData)

        // workbook = xlsx.readFile(workBookPath);
        // let sheetNames = workbook.SheetNames
        // sheetNames.splice(sheetNames.indexOf('Query'), 1)
        // workbook.SheetNames = sheetNames
        // console.log(workbook.SheetNames, workbook)
    }
})


export default router