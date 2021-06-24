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

const getGraphQLData = (reqObj) => {
    //queries mongo database and attached returned data to request obj, then returns.
    return new Promise((resolve, reject) => {
        let queryParams = reqObj.q
        const getAPIData = `http://localhost:5000/qGraphQL?query=${queryParams}`
        console.log('getAPIData', getAPIData)
        fetch(getAPIData)
        .then((r)=>r.json())
        .then(data=>{
            for (const x in data){
                reqObj.data = data[x]
                resolve(reqObj)
            }})
        .catch((err)=>{
            console.log("error: ", err)
            reject(err)
        })
    })
}

const buildQueryList = (path) => {
    //From requested template, builds list of mongoDB promises requests from Query sheet.
    const returnList = []
    let workbook = xlsx.readFile(path);
    const querySheet = workbook.Sheets['Query']
    const queryList = Papa.parse(xlsx.utils.sheet_to_csv(querySheet)).data
    for (const q in queryList) { //for each query in special query sheet.
        if (queryList[q][0] && queryList[q][0] !== '') {
            // console.log('pushing', queryList[q][0] )
            returnList.push(getGraphQLData({
                n: queryList[q][0], //data name
                q: queryList[q][1], //query string
            }))
        }
    }
    return returnList
}

const processPromiseData = (res) => {
    //build dataObj containing results of mongoDB ALL requests
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
    dataObj.keys = [...dataObj.keys] //list from SET,avoids and possible duplicate in keys
    return dataObj
}

function findByString(searchObj, thisSearch){ //find value in nested object
    let searchList = [...thisSearch]
    if (searchList.length === 1) { //base case of recursive search.
        let ret = searchObj[searchList]
        if (Array.isArray(ret)) {return ([...ret])}
        else if (typeof ret === 'object') {return {...ret}}
        else {return ret}
    } else {
        let searchTerm = searchList.shift()
        if (searchObj[searchTerm]) {
            let foundObj = searchObj[searchTerm]
            return findByString(foundObj, searchList)
        } else {
            console.log('FILTER NOT FOUND:', searchList)
            return({})
        }
    }
}


function getDataSlice(dataObj, queryString){
    //iterates through all dataObj keys to finds all matching slices 
    //return object {security(s): value(s)}    
    const returnObj = {}

    const keys = dataObj.keys
    for (const s of keys){
        const queryList = queryString.split('.') 
        if (typeof dataObj?.[queryList[0]]?.[s]?.[queryList[1]] !== 'undefined') { //dataPoint
            const queryStringWithStock = [queryList[0], s, ...queryList.slice(1, queryList.length)] //creates tuple [searchKey, security, datapoint]
            let findData = findByString(dataObj, queryStringWithStock)
            returnObj[s] = findData
        } else { //Time series
            const timeSeriesSlice = dataObj?.[queryList[0]]?.[s]
            const val = {}
            for (const t in timeSeriesSlice) {
                val[t] = timeSeriesSlice?.[t]?.[queryList[1]]
            }
            returnObj[s] = val
        }
    }
    return returnObj
}

function makeTempDir(tempPath){
    console.log('make path:', tempPath)
    if (!fs.existsSync(tempPath)) {
        fs.mkdir(tempPath, (err) => {
            if (err) {
                console.error(err);
            }
        })
    }
    return true
}

async function buildTemplateData(promiseData, workBookPath){
    //transform promise data
    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(workBookPath)
    const templateData = {} 
    wb.eachSheet((worksheet)=>{
    if (worksheet.name !== 'Query') {
            templateData[worksheet.name] = {sheetKeys: new Set()} //sheet keys used in case data points need to be split into multiple worksheets.
            worksheet.eachRow((row, rowNumber)=>{
                const thisRow = {
                    data: {},
                    writeRows: 0, //if zero skip in later steps. Used for inserting new rows if greater than 1.
                    keyColumns: {}, //list of columns where key needs to be updated.
                }
                for (const x in row.values) {
                    if (typeof row?.values?.[x] === 'string' && row?.values?.[x]?.slice(0,2) === '&=') { //if template formula detected.
                        const searchStringRaw = row.values[x]
                        const searchString = searchStringRaw.slice(2, searchStringRaw.length)
                        if (searchString !== 'keys.keys') { //if data column
                            const dataObj = getDataSlice(promiseData, searchString) //could {key: string} pairs OR {key: OBJECT} pairs
                            // console.log(x, dataObj)
                            for (const s in dataObj) {
                                // console.log('s', s)
                                templateData[worksheet.name]['sheetKeys'].add(s)
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
    return templateData
}

function printTemplateWorksheets(w, worksheetName, worksheetKeys, sourceTemplate){
    //create template copys for each security key if query string multi=true
    // console.log('print', worksheetName)
    // console.log('CREATING SHEETS')
    for (const s of worksheetKeys) {
        let copySheet = w.addWorksheet(`temp`)
        copySheet.model = sourceTemplate.model
        copySheet.name = `${worksheetName}-${s}`
    }

}

function checkTimeSeriesStatus(ws, promiseData){ //Checks promise data to determine if its time series or data point.
    //data point = key: string
    //time series = key: object
    let returnFlag = 0
    ws.eachRow({includeEmpty: false},(row)=>{ //for each row
        row.eachCell({ includeEmpty: false },(cell)=>{ //for each cell
            if (returnFlag === 0 && typeof cell.value === 'string' && cell.value.slice(0,2) === '&=') { //if template formula detected
                const searchStringRaw = cell.value
                const searchString = searchStringRaw.slice(2, searchStringRaw.length) //remove &=
                if (searchString !== 'keys.keys') { //if data column
                    const dataObj = getDataSlice(promiseData, searchString) //could {key: string} pairs OR {key: OBJECT} pairs
                    
                    if (typeof dataObj[Object.keys(dataObj)[0]] === 'object') {
                        // console.log('returning 1', dataObj)
                        returnFlag = 1
                    }
                    // console.log('----dataObjFlag----:', returnFlag, dataObj)
                }
            }
        })
    })

    return returnFlag
}

function writeTimeSeriesSheetSingle(w, ws, s, templateData){
    let rowIterator = 0 //if multiSheet = 'false: add 1 for each line written so that writer doesnt fall out of sync with file.
    const templateWorksheet = templateData[s]
    const addedRows = [] //if multiSheet = 'false: list of rows added to template. Used to adjust any excel formulas as they dont auto update when adding rows.
    // console.log('starting write time series')
    for (const row in templateWorksheet) { // for each TEMPLATE row in worksheet. This operation will add rows = time series count X number of securities.
        const dataRow = templateWorksheet[row].data //list of rows to be updated from template file. 
        const writeRows =  templateWorksheet[row].writeRows //used to create range of rows we need to  update.
        const keyColumns =  templateWorksheet[row].keyColumns //list of key columns for each row. {...integers: integer}
        let currentKey = '' //the current security key
        let currKeyColumn = 0 //ref to the source of current security key
        // console.log('starting write time series2')
        for (let step = 1; step <= writeRows; step++) { //iterate over new rows that data will populate into
            let timeSeriesFlag = 1
            let startRow = 0 //saves the start line for time series data
            let dataRowCount = 0 //number of rows to enter data for time series
            // console.log('starting write time series3')
            for (const updateCell in dataRow) { //{...rowInteger: {...security || key Integer: value || timeSeries{}}}
                if (keyColumns[updateCell]) {  //update if key column integer. If security this test will fail as security ref is string.
                    // console.log('starting write time series4.1')
                    currentKey = dataRow?.[updateCell]?.[step-1]
                    currKeyColumn = updateCell //Whenever a key value is in a cell update keyColumn. That way multiple keys can exist in the same row.
                    if (dataRow[updateCell][step-1] && typeof dataRow[updateCell][step-1] === 'string') {
                        // console.log('starting write time series4.2')
                        ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = dataRow[updateCell][step-1]
                    }
                } else if (typeof dataRow[updateCell][currentKey] !== 'object') {
                    // console.log('starting write time series4.3') 
                    if (ws !== undefined) ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = dataRow[updateCell][currentKey]
                } else { 
                    // console.log('starting write time series4.4')
                    const dataGroup = dataRow[updateCell][currentKey]
                    if (timeSeriesFlag === 1) { //only run once.
                        timeSeriesFlag = 2;
                        startRow = rowIterator
                        dataRowCount = Object.keys(dataGroup).length
                        for (let i = 1; i <= dataRowCount; i++) {
                            let newRow = parseInt(row) + rowIterator + i 
                            ws.insertRow(newRow).commit()
                            addedRows.push(newRow)
                        }
                        rowIterator = rowIterator + dataRowCount 
                        // console.log('rowIterator', rowIterator)
                    }
                    for (let d = 0; d < dataRowCount;  d++){ //enter data for column
                        const key = Object.keys(dataGroup)[d]
                        ws.getRow(parseInt(startRow) + d + 2).getCell(parseInt(updateCell)).value = dataGroup[key]
                        ws.getRow(parseInt(startRow) + d + 2).getCell(parseInt(currKeyColumn)).value = currentKey
                        ws.getRow(parseInt(startRow) + d + 2).commit()
                    }
                }
            }
        }
    }
    
    ws.eachRow({includeEmpty: false},(row, rowNumber)=>{
        //update all formula cells. Offset their row references by number of rows added before or inside of formula range.
        row.eachCell({ includeEmpty: false },(cell, colNumber)=>{
            if (typeof cell.value === 'object') { //if excel formula
                let updateString = cell.value.formula
                let updateList = []
                let re = new RegExp(/(?:^|[^0-9])([A-Z](?:100|[0-9][0-9]?))(?=$|[^0-9A-Z])/g)
                let allMatches = cell?.value?.formula?.matchAll(re) ? [...cell.value.formula.matchAll(re)] : []
                for (const m in allMatches) {
                    let matchRow = parseInt(allMatches[m][1].replace(new RegExp(/\D/g), ''))
                    let matchColumn = allMatches[m][1].replace(new RegExp(/[0-9]/g), '')
                    for (const r in addedRows) {
                        if (matchRow >= parseInt(addedRows[r])) matchRow = matchRow + 1
                    }
                    const updateRef = matchColumn + matchRow
                    updateList.unshift([allMatches[m][1], updateRef]) //update row values in reverse order so you dont double update starting row.
                }
                for (const u in updateList) {
                    updateString = updateString.replace(updateList[u][0], updateList[u][1])
                }
                const newValue = cell.value
                newValue.formula = updateString
                ws.getRow(rowNumber).getCell(colNumber).value = newValue
            }
        })
        ws.getRow(row).commit()
    })
}


function dataPointSheetSingle(w, ws, s, templateData){
    console.log('data point sheet single')
    let rowIterator = 0 //if multiSheet = 'false: add 1 for each line written so that writer doesnt fall out of sync with file.
    const templateWorksheet = templateData[s]
    const addedRows = [] //if multiSheet = 'false: list of rows added to template. Used to adjust any excel formulas as they dont auto update when adding rows.
    for (const row in templateWorksheet) { // for each TEMPLATE row in worksheet. This operation will almost always add rows to return file.
        const dataRow = templateWorksheet[row].data //list of rows to be updated from template file. 
        const writeRows =  templateWorksheet[row].writeRows //used to create range of rows we need to  update.
        const keyColumns =  templateWorksheet[row].keyColumns //list of key columns for each row. {...integers: integer}
        let currentKey = '' //the current security key
        for (let step = 1; step <= writeRows; step++) { //iterate over new rows that data will populate into
            for (const updateCell in dataRow) { //{...rowInteger: {...security || key Integer: value || timeSeries{}}}
                if (keyColumns[updateCell]) {  //update if key column integer. If security this test will fail as security ref is string.
                    currentKey = dataRow?.[updateCell]?.[step-1]
                    if (dataRow[updateCell][step-1] && typeof dataRow[updateCell][step-1] === 'string') {
                        ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = dataRow[updateCell][step-1]
                    }
                } else if (typeof dataRow[updateCell][currentKey] !== 'object') { //update if data point
                    if (ws !== undefined) ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = dataRow[updateCell][currentKey]
                } 
            }
                ws.getRow(row + rowIterator).commit()
                if (step !== writeRows) { 
                    let newRow = parseInt(row) + rowIterator + 1
                    ws.insertRow(newRow).commit()
                    addedRows.push(newRow)
                    rowIterator = rowIterator + 1
                }
        }
    }
    
    ws.eachRow({includeEmpty: false},(row, rowNumber)=>{
        //update all formula cells. Offset their row references by number of rows added before or inside of formula range.
        row.eachCell({ includeEmpty: false },(cell, colNumber)=>{
            if (typeof cell.value === 'object') { //if excel formula
                let updateString = cell.value.formula
                let updateList = []
                let re = new RegExp(/(?:^|[^0-9])([A-Z](?:100|[0-9][0-9]?))(?=$|[^0-9A-Z])/g)
                let allMatches = cell.value.formula.matchAll(re) ? [...cell.value.formula.matchAll(re)] : []
                for (const m in allMatches) {
                    let matchRow = parseInt(allMatches[m][1].replace(new RegExp(/\D/g), ''))
                    let matchColumn = allMatches[m][1].replace(new RegExp(/[0-9]/g), '')
                    for (const r in addedRows) {
                        if (matchRow >= parseInt(addedRows[r])) matchRow = matchRow + 1
                    }
                    const updateRef = matchColumn + matchRow
                    updateList.unshift([allMatches[m][1], updateRef]) //update row values in reverse order so you dont double update starting row.
                }
                for (const u in updateList) {
                    updateString = updateString.replace(updateList[u][0], updateList[u][1])
                }
                const newValue = cell.value
                newValue.formula = updateString
                ws.getRow(rowNumber).getCell(colNumber).value = newValue
            }
        })
        ws.getRow(row).commit()
    })

}

function dataPointSheetMulti(w, ws, s, templateData){
    console.log('---PROCESSING MULTI---')
    let rowIterator = 0 //if multiSheet = 'false: add 1 for each line written so that writer doesnt fall out of sync with file.
    printTemplateWorksheets(w, s, templateData[s].sheetKeys, ws) //create new worksheets for each security
    const templateWorksheet = templateData[s]
    for (const row in templateWorksheet) { // for each TEMPLATE row in worksheet. This operation will almost always add rows to return file.
        const dataRow = templateWorksheet[row].data //list of rows to be updated from template file. 
        const writeRows =  templateWorksheet[row].writeRows //used to create range of rows we need to  update.
        const keyColumns =  templateWorksheet[row].keyColumns //list of key columns for each row. {...integers: integer}
        let currentKey = '' //the current security key
        for (let step = 1; step <= writeRows; step++) { //iterate over new rows that data will populate into
            for (const updateCell in dataRow) { //{...rowInteger: {...security || key Integer: value || timeSeries{}}}
                if (keyColumns[updateCell]) {  //update if key column integer. If security this test will fail as security ref is string.
                    currentKey = dataRow?.[updateCell]?.[step-1]
                    if (dataRow[updateCell][step-1] && typeof dataRow[updateCell][step-1] === 'string') {
                        ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = dataRow[updateCell][step-1]
                    }
                } else { //update data point cells.
                    const tws = w.getWorksheet(`${s}-${currentKey}`)
                    if (tws !== undefined) tws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = dataRow[updateCell][currentKey]
                }
            }
            ws.getRow(row + rowIterator).commit()
        }
    }
    w.removeWorksheet(ws.id)
}


router.get('/runTemplate', async (req, res) => { //run user configured excel template and return result.
    const apiKey = format('%L', req.query['key'])
    const multiSheet = req.query['multi']
    const findUser = `
        SELECT id
        FROM users
        WHERE apiKey = ${apiKey} OR apiAlias = ${apiKey}
    `
    //copy target template into temp folder
    const userRows = await db.query(findUser)
    const user = userRows?.rows?.[0]?.id
    const workBookPath = `${appRootPath}/uploads/${user}/${req.query.template}`
    const tempFolder = `${appRootPath}/uploads/${user}/`
    const tempPath = `${appRootPath}/uploads/${user}/temp/`
    const trimFileName = req.query.template.slice(0, req.query.template.indexOf('.xls'))
    const tempFile = `${appRootPath}/uploads/${user}/temp/${trimFileName}${Date.now()}.xlsx`

    await makeTempDir(tempFolder)
    await makeTempDir(tempPath)    

    if (fs.existsSync(workBookPath)) { //if template name provided by get requests exists
        const promiseList = await buildQueryList(workBookPath) //List of promises built from excel templates query sheet
        const promiseData = await Promise.all(promiseList)  //after promises run process promise data {keys: [], data: {}} FROM mongoDB
            .then((res) => {
                return processPromiseData(res)
        })
        const templateData = await buildTemplateData(promiseData, workBookPath) //{...sheetName {...row:{data:{}, writeRows: number, keyColumns: {}}}} from Template File
        const w = new Excel.Workbook()
        await w.xlsx.readFile(workBookPath)
        for (const s in templateData) { //for each worksheet
            const ws = w.getWorksheet(s)
            let timeSeriesFlag = checkTimeSeriesStatus(ws, promiseData)  //set to 1 if worksheet contains time series data.
            if (timeSeriesFlag === 1) {
                writeTimeSeriesSheetSingle(w, ws, s, templateData)
            } else if (multiSheet !== 'true') {
                dataPointSheetSingle(w, ws, s, templateData)
            } else {
                dataPointSheetMulti(w, ws, s, templateData)
            }
        }
        const deleteSheet = w.getWorksheet('Query')
        w.removeWorksheet(deleteSheet.id)
        await w.xlsx.writeFile(tempFile)
        res.status(200).sendFile(tempFile, ()=>{
            fs.unlinkSync(tempFile)
        })

    }
})

router.post('/generateTemplate', async (req, res) => { //create and process widget derived template.
    // Post: apiKey, dashboard, widget, columnKeys <--Make this alias if available or key
    console.log('/generateTemplate')
    const reqData = req.body
    const apiKey = format('%L', reqData.apiKey)
    const multiSheet = 'false'
    const findUser = `
        SELECT id
        FROM users
        WHERE apiKey = ${apiKey} OR apiAlias = ${apiKey}
    `
    //copy target template into temp folder
    const userRows = await db.query(findUser)
    const user = userRows?.rows?.[0]?.id

    const workBookPath = `${appRootPath}/uploads/${user}/temp/excelTemplate${Date.now()}`
    const workBookName = workBookPath + '.xlsx'
    const tempFolder = `${appRootPath}/uploads/${user}/`
    const tempPath = `${appRootPath}/uploads/${user}/temp/`
    await makeTempDir(tempFolder)
    await makeTempDir(tempPath) 
    const trimFileName = 'excelTemplateReturnFile'
    const tempFile = `${appRootPath}/uploads/${user}/temp/${trimFileName}${Date.now()}.xlsx`

    const wn = new Excel.Workbook()
    //Query sheet templating
    const querySheet = wn.addWorksheet('Query') //build query worksheet
    let security =  reqData.security ? `security: "${reqData.security}"` : ''
    let visable =  reqData.visable ? `visable: "${reqData.visable}"` : ''
    // console.log('reducers', `{widget(key: "${reqData.apiKey}" dashboard: "${reqData.dashboard}" widget: "${reqData.widget}" ${security} ${visable} ) {security, data}}`)

    let queryRow = querySheet.getRow(1)
    queryRow.getCell(1).value = 'dataName'
    queryRow.getCell(2).value = `{widget(key: "${reqData.apiKey}" dashboard: "${reqData.dashboard}" widget: "${reqData.widget}" ${security} ${visable} ) {security, data}}`
    queryRow.getCell(3).value = '***ADD Columns A and B to the "Query" worksheet when designing custom excel templates***'
    queryRow.getCell(3).font = {bold: true}
    queryRow.commit()

    queryRow = querySheet.getRow(3)
    queryRow.getCell(3).value = '***ADD THE BELOW template tags TO ANY Excel sheet, not named query, in order to populate data into an excel template. ***'
    queryRow.getCell(3).font = {bold: true}
    queryRow.commit()

    //data markup tag templating
    let dataColumns = reqData.columnKeys
    queryRow = querySheet.getRow(4)
    queryRow.getCell(3).value = 'Security'
    for (const d in dataColumns){
        queryRow.getCell(parseInt(d) + 4).value = Object.keys(dataColumns[d])[0]
    }
    queryRow.commit()
    //template data row
    queryRow = querySheet.getRow(5)
    queryRow.getCell(3).value = '&=keys.keys'
    for (let d in dataColumns){
        queryRow.getCell(parseInt(d) + 4).value = `&=dataName.${ Object.values(dataColumns[d])[0]}`
    }
    queryRow.commit()

    //build data worksheet
    const dataSheet = wn.addWorksheet('Data') 
    let dataRow = dataSheet.getRow(1)
    dataRow.getCell(1).value = 'Security'
    for (const d in dataColumns){
        dataRow.getCell(parseInt(d) + 2).value = Object.keys(dataColumns[d])[0]
    }
    dataRow.commit()
    dataRow = dataSheet.getRow(2)
    dataRow.getCell(1).value = '&=keys.keys'
    for (let d in dataColumns){
        dataRow.getCell(parseInt(d) + 2).value = `&=dataName.${ Object.values(dataColumns[d])[0]}`
    }
    dataRow.commit()
    //  write/overwrite user dataTemplate
    await wn.xlsx.writeFile(workBookName)
        const promiseList = await buildQueryList(workBookName, reqData.reducers) //List of promises built from excel templates query sheet
        const promiseData = await Promise.all(promiseList)  //after promises run process promise data {keys: [], data: {}} FROM mongoDB
            .then((res) => {
                return processPromiseData(res)
        })
        
        const templateData = await buildTemplateData(promiseData, workBookName) //{...sheetName {...row:{data:{}, writeRows: number, keyColumns: {}}}} from Template File
        const w = new Excel.Workbook()
        await w.xlsx.readFile(workBookName)
        for (const s in templateData) { //for each worksheet
            const ws = w.getWorksheet(s)
            let timeSeriesFlag = checkTimeSeriesStatus(ws, promiseData)  //set to 1 if worksheet contains time series data.
            if (timeSeriesFlag === 1) {
                writeTimeSeriesSheetSingle(w, ws, s, templateData)
            } else if (multiSheet !== 'true') {
                dataPointSheetSingle(w, ws, s, templateData)
            } else {
                dataPointSheetMulti(w, ws, s, templateData)
            }
        }
        await w.xlsx.writeFile(tempFile)
        await res.status(200).sendFile(tempFile, ()=>{
            fs.unlinkSync(workBookName)
            fs.unlinkSync(tempFile)
        })
})

export default router


// router.post('/runTemplate', async (req, res) => {
//     //route accessable via APIKEY or Alias.
//     //get user ID
//     // console.log(req.query)
//     const apiKey = format('%L', req.query['key'])
//     const multiSheet = req.query['multi']
//     const findUser = `
//         SELECT id
//         FROM users
//         WHERE apiKey = ${apiKey} OR apiAlias = ${apiKey}
//     `
//     //copy target template into temp folder
//     const userRows = await db.query(findUser)
//     const user = userRows?.rows?.[0]?.id
//     const workBookPath = `${appRootPath}/uploads/${user}/${req.query.template}`
//     const tempPath = `${appRootPath}/uploads/${user}/temp/`
//     const trimFileName = req.query.template.slice(0, req.query.template.indexOf('.xls'))
//     const tempFile = `${appRootPath}/uploads/${user}/temp/${trimFileName}${Date.now()}.xlsx`

//     if (fs.existsSync(workBookPath)) { //if template name provided by get requests exists
//         makeTempDir(tempPath) //make temp directory for user if it doesnt already exist.        
//         const promiseList = await buildQueryList(workBookPath) //List of promises built from excel templates query sheet
//         const promiseData = await Promise.all(promiseList)  //after promises run process promise data {keys: [], data: {}} FROM mongoDB
//             .then((res) => {
//                 return processPromiseData(res)
//         })
//         const templateData = await buildTemplateData(promiseData, workBookPath) //{...sheetName {...row:{data:{}, writeRows: number, keyColumns: {}}}} from Template File
//         const w = new Excel.Workbook()
//         await w.xlsx.readFile(workBookPath)
//         // .then(()=>{ 
//         for (const s in templateData) { //for each worksheet
//             const ws = w.getWorksheet(s)
//             let timeSeriesFlag = checkTimeSeriesStatus(ws, promiseData)  //set to 1 if worksheet contains time series data.
//             if (timeSeriesFlag === 1) {
//                 // console.log('creating time series worksheet2')
//                 writeTimeSeriesSheetSingle(w, ws, s, templateData)
//             } else if (multiSheet !== 'true') {
//                 // console.log('creating data point single')
//                 dataPointSheetSingle(w, ws, s, templateData)
//             } else {
//                 // console.log('creating data point multi')
//                 dataPointSheetMulti(w, ws, s, templateData)
//             }
//         }
//         const deleteSheet = w.getWorksheet('Query')
//         w.removeWorksheet(deleteSheet.id)
//         await w.xlsx.writeFile(tempFile)
//         // .then(()=>{
//             // console.log('sending: ', tempFile)
//         res.status(200).sendFile(tempFile, ()=>{
//             // fs.unlinkSync(tempFile)
//         })
//         // })
//         // })
//     }
// })