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
        fetch(getAPIData)
        .then((r)=>r.json())
        .then(data=>{
            for (const x in data){
                reqObj.data = data[x]
                resolve(reqObj)
            }})
    })
}

function getDataSlice(dataObj, queryString){
    //iterates through all dataObj keys to finds all matching slices 
    //return object {security(s): value(s)}
    
    const returnObj = {}
    const queryStringList = queryString.split('.')
    const keys = dataObj.keys
    for (const s of keys){
        if (typeof dataObj?.[queryStringList[0]]?.[s]?.[queryStringList[1]] !== 'undefined') { 
            //data point data
            const val = dataObj?.[queryStringList[0]]?.[s]?.[queryStringList[1]]
            returnObj[s] = val
        } else {
            //time series data
            const timeSeriesSlice = dataObj?.[queryStringList[0]]?.[s]
            const val = {}
            for (const t in timeSeriesSlice) {
                val[t] = timeSeriesSlice[t][queryStringList[1]]
            }
            returnObj[s] = val
        }
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
    const promiseList = [] //all data required to update spreadsheet.

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
            fs.mkdir(tempPath, (err) => {
                if (err) {
                    return console.error(err);
                }
            })
        }

        //read template, create data object, create temp file to be written to.
        //update key columns and writecolumn count.
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
                        writeRows: 0, //if zero skip in later steps. Used for inserting new rows if greater than 1.
                        keyColumns: {}, //list of columns where key needs to be updated.
                    }
                    for (const x in row.values) {
                        if (typeof row?.values?.[x] === 'string' && row?.values?.[x]?.slice(0,2) === '&=') { //if template formula deted.
                            const searchStringRaw = row.values[x]
                            const searchString = searchStringRaw.slice(2, searchStringRaw.length)
                            if (searchString !== 'keys.keys') { //if data column
                                const dataObj = getDataSlice(promiseData, searchString) //could {key: string} pairs OR {key: OBJECT} pairs
                                for (const s in dataObj) {
                                    if (typeof dataObj[s] === 'object'){ //count number of rows if time series data in dataset.
                                        thisRow.writeRows = thisRow.writeRows +  Object.keys(dataObj[s]).length
                                    } 
                                }
                                if (Object.keys(dataObj).length > thisRow.writeRows) {thisRow.writeRows = Object.keys(dataObj).length} 
                                thisRow.data[x] = dataObj
                            } else { //if key column
                                thisRow.data[x] = {...promiseData.keys}
                                thisRow.keyColumns[x] = x
                            }
                        }
                    }
                    templateData[worksheet.name][rowNumber] = thisRow
                })
            }
        })

        // console.log(templateData['Sheet2']['2']['data']['3'] //['US-WMT'])
        const w = new Excel.Workbook()
        w.xlsx.readFile(workBookPath)
        .then(()=>{ //write templatedata to temporary worksheet copied from source template.
            let rowIterator = 0 //add 1 for each line written so that writer doesnt fall out of sync with file.
            for (const s in templateData) { //for each worksheet
                const ws = w.getWorksheet(s) 
                const addedRows = []
                if (s !== 'keys') { 
                    const templateWorksheet = templateData[s]
                    for (const row in templateWorksheet) { // for each TEMPLATE row in worksheet
                        const data = templateWorksheet[row].data //list of rows to be updated. 
                        const writeRows =  templateWorksheet[row].writeRows //used to create range of rows we need to  update.
                        const keyColumns =  templateWorksheet[row].keyColumns //key columns
                        let currentKey = '' //the current security key
                        let currKeyColumn = 0 //ref to the source of current security key
                        for (let step = 1; step <= writeRows; step++) { //iterate over new rows that data will populate into
                            let timeSeries = 0 //switch to 1 if time series data found
                            let startRow = 0 //saves the start line for time series data
                            let dataRowCount = 0 //number of rows to enter data for time series
                            for (const updateCell in data) {
                                if (keyColumns[updateCell]) {  //update if key column
                                    currentKey = data?.[updateCell]?.[step-1]
                                    currKeyColumn = updateCell
                                    if (data[updateCell][step-1] && typeof data[updateCell][step-1] === 'string') {
                                        ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = data[updateCell][step-1]
                                    }
                                } else if (typeof data[updateCell][currentKey] !== 'object') { //update if data point
                                    // console.log('here', data[updateCell][currentKey])
                                    ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = data[updateCell][currentKey]
                                } else { //update if time series
                                    console.log('currentKey', currentKey)
                                    const dataGroup = data[updateCell][currentKey]
                                    // if (dataGroup !== undefined) console.log('---------dataGroup-------------', JSON.stringify(dataGroup, null, 2))
                                    if (timeSeries === 0) { //only run once.
                                        
                                        timeSeries = 1;
                                        startRow = rowIterator
                                        dataRowCount = Object.keys(dataGroup).length
                                        console.log('creating new rows:', dataRowCount)
                                        for (let i = 1; i <= dataRowCount; i++) {
                                            let newRow = parseInt(row) + rowIterator + i 
                                            console.log('newRow', newRow)
                                            ws.insertRow(newRow).commit()
                                            addedRows.push(newRow)
                                            
                                        }
                                        rowIterator = rowIterator + dataRowCount 
                                    }
                                    
                                    for (let d = 0; d < dataRowCount;  d++){ //enter data for column
                                        const key = Object.keys(dataGroup)[d]
                                        ws.getRow(parseInt(startRow) + d + 2).getCell(parseInt(updateCell)).value = dataGroup[key]
                                        ws.getRow(parseInt(startRow) + d + 2).getCell(parseInt(currKeyColumn)).value = currentKey
                                        ws.getRow(parseInt(startRow) + d + 2).commit()
                                    }

                                }
                            }
                            if (timeSeries === 0) {
                                ws.getRow(row + rowIterator).commit()
                                if (step !== writeRows) {
                                    let newRow = parseInt(row) + rowIterator + 1
                                    ws.insertRow(newRow).commit()
                                    addedRows.push(newRow)
                                }
                                rowIterator = rowIterator + 1
                            }
                        }
                    }
                }
                //next update all formula cells. Offset their row references by number of rows added before or inside of formula range.
                ws.eachRow({includeEmpty: false},(row, rowNumber)=>{
                    // console.log('getRow', rowNumber)
                    row.eachCell({ includeEmpty: false },(cell, colNumber)=>{
                        if (typeof cell.value === 'object') { //if excel formula
                            console.log(cell.value)
                            let updateString = cell.value.formula
                            let updateList = []
                            // console.log('1:', updateString, typeof updateString)
                            let re = new RegExp(/(?:^|[^0-9])([A-Z](?:100|[0-9][0-9]?))(?=$|[^0-9A-Z])/g)
                            let allMatches = cell.value.formula.matchAll(re) ? [...cell.value.formula.matchAll(re)] : []
                            for (const m in allMatches) {
                                let matchRow = parseInt(allMatches[m][1].replace(new RegExp(/\D/g), ''))
                                let matchColumn = allMatches[m][1].replace(new RegExp(/[0-9]/g), '')
                                for (const r in addedRows) {
                                    if (matchRow >= parseInt(addedRows[r])) matchRow = matchRow + 1
                                }
                                const updateRef = matchColumn + matchRow
                                // console.log('2:', allMatches[m][1], updateRef)
                                updateList.unshift([allMatches[m][1], updateRef]) //update row values in reverse order so you dont double update starting row.
                            }
                            for (const u in updateList) {
                                // console.log('3:',updateString.indexOf(updateList[u][0]), updateList[u][1])
                                updateString = updateString.replace(updateList[u][0], updateList[u][1])
                            }
                            // console.log('4:', updateString)
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