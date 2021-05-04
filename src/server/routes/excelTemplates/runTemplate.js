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
    const trimFileName = req.query.template.slice(0, req.query.template.indexOf('.xls'))
    const tempFile = `${appRootPath}/uploads/${user}/temp/${trimFileName}${Date.now()}.xlsx`
    
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
            dataObj.keys = [...dataObj.keys] //avoids and possible duplicate in keys
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
        const templateData = {} 
        // fs.copyFileSync(workBookPath, tempFile)
        let wb = new Excel.Workbook()
        await wb.xlsx.readFile(workBookPath)
        wb.eachSheet((worksheet, sheetid)=>{
            if (worksheet.name !== 'Query') {
                templateData[worksheet.name] = {}
                worksheet.eachRow((row, rowNumber)=>{
                    const thisRow = {
                        data: {},
                        writeColumns: 0, //if zero skip in later steps. Used for inserting new rows if greater than 1.
                        keyColumns: {}, //list of columns where key needs to be updated.
                    }
                    for (const x in row.values) {
                        // console.log(typeof row?.values?.[x])
                        if (typeof row?.values?.[x] === 'string' && row?.values?.[x]?.slice(0,2) === '&=') {
                            const searchStringRaw = row.values[x]
                            const searchString = searchStringRaw.slice(2, searchStringRaw.length)
                            if (searchString !== 'keys.keys') {
                                const dataObj = getDataSlice(promiseData, searchString)
                                if (Object.keys(dataObj).length > thisRow.writeColumns) {thisRow.writeColumns = Object.keys(dataObj).length}
                                thisRow.data[x] = dataObj
                            } else {
                                thisRow.data[x] = {...promiseData.keys}
                                // thisRow.data[x] = {}
                                // promiseData.keys.forEach((i)=>{thisRow.data[x][i] = i})
                                thisRow.keyColumns[x] = x
                                // console.log('Key Column ', thisRow.keyColumns)
                            }
                        }
                    }
                    // console.log('Row ' + rowNumber + ' : ', thisRow );
                    templateData[worksheet.name][rowNumber] = thisRow
                    // console.log(templateData[worksheet.name][rowNumber]) 
                })
            }
        })
        // console.log(templateData)

        const w = new Excel.Workbook()
        w.xlsx.readFile(workBookPath)
        .then(()=>{ //write templatedata to temporary worksheet copied from source template.
            let rowIterator = 0 //add 1 for each line written so that writer doesnt fall out of sync with file.
            for (const s in templateData) { //for each worksheet
                const ws = w.getWorksheet(s) 
                const addedRows = []
                if (s !== 'keys') { 
                    const templateWorksheet = templateData[s]
                    for (const row in templateWorksheet) { // for each row in worksheet
                        const data = templateWorksheet[row].data //list of rows to be updated. 
                        const writeColumns =  templateWorksheet[row].writeColumns //used to create range we need to work through.
                        const keyColumns =  templateWorksheet[row].keyColumns //key columns
                        let currentKey = '' //the current security key
                        // console.log('row:', row, data, writeColumns, keyColumns)
                        for (let step = 1; step <= writeColumns; step++) {
                            for (const updateCell in data) {
                                if (keyColumns[updateCell]) { 
                                    currentKey = data[updateCell][step-1]
                                    ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = data[updateCell][step-1]
                                } else {
                                    ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = data[updateCell][currentKey]
                                }
                            }
                            ws.getRow(row + rowIterator).commit()
                            if (step !== writeColumns) {
                                let newRow = parseInt(row) + rowIterator + 1
                                ws.insertRow(newRow).commit()
                                addedRows.push(newRow)
                            }
                            rowIterator = rowIterator + 1
                        }
                    }
                }
                console.log(addedRows) //next update all formula cells. Offset their row references be number of rows added before or inside of formula range.
                ws.eachRow({includeEmpty: false},(row, rowNumber)=>{
                    row.eachCell({ includeEmpty: false },(cell, colNumber)=>{
                        if (typeof cell.value === 'object') {
                            let updateString = cell.value.formula
                            let updateList = []
                            console.log('1:', updateString, typeof updateString)
                            let re = new RegExp(/(?:^|[^0-9])([A-Z](?:100|[0-9][0-9]?))(?=$|[^0-9A-Z])/g)
                            let allMatches = [...cell.value.formula.matchAll(re)]
                            for (const m in allMatches) {
                                let matchRow = parseInt(allMatches[m][1].replace(new RegExp(/\D/g), ''))
                                let matchColumn = allMatches[m][1].replace(new RegExp(/[0-9]/g), '')
                                for (const r in addedRows) {
                                    if (matchRow >= parseInt(addedRows[r])) matchRow = matchRow + 1
                                }
                                const updateRef = matchColumn + matchRow
                                console.log('2:', allMatches[m][1], updateRef)
                                updateList.unshift([allMatches[m][1], updateRef]) //update row values in reverse order so you dont double update starting row.
                            }
                            for (const u in updateList) {
                                console.log('3:',updateString.indexOf(updateList[u][0]), updateList[u][1])
                                updateString = updateString.replace(updateList[u][0], updateList[u][1])
                            }
                            console.log('4:', updateString)
                            const newValue = cell.value
                            newValue.formula = updateString
                            ws.getRow(rowNumber).getCell(colNumber).value = newValue
                        }
                    })
                    ws.getRow(row).commit()
                })
            }
            

            w.xlsx.writeFile(tempFile)
        })

    }
})


export default router


// A34A1
// 5A1
// 2.344A1
// A1001
// A1
// A10
// A100
// SUM(A1:A2)
// SUM(A1:A2, 5A1, A3)
