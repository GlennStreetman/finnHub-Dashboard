import express from 'express';
import appRootPath from 'app-root-path'
import fs from 'fs';
import format from "pg-format";

import Excel from 'exceljs';

import dbLive from "../../db/databaseLive.js"
import devDB from "../../db/databaseLocalPG.js"

//import template actions
import { buildQueryList } from './actions/buildQueryList.js'
import { processPromiseData } from './actions/processPromiseData.js'

import { makeTempDir } from './actions/makeTempDir.js';
import { buildTemplateData } from './actions/buildTemplateData.js'
import { checkTimeSeriesStatus } from './actions/checkTimeSeriesStatus.js'
import { writeTimeSeriesSheetSingle } from './actions/writeTimeSeriesSheetSingle.js'
import { dataPointSheetSingle } from './actions/dataPointSingle.js'
import { dataPointSheetMulti } from './actions/dataPointSheetMulti.js'

const db = process.env.live === "1" ? dbLive : devDB;

const router = express.Router();

interface session {
    login: boolean,
    uID: number,
}

interface uploadTemplate extends Request {
    session: session,
    query: any
}

router.get('/runTemplate', async (req: uploadTemplate, res: any) => { //run user configured excel template and return result.
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
    const uploadsFolder = `${appRootPath}/uploads/`
    const tempFolder = `${appRootPath}/uploads/${user}/`
    const tempPath = `${appRootPath}/uploads/${user}/temp/`
    const trimFileName = req.query.template.slice(0, req.query.template.indexOf('.xls'))
    const tempFile = `${appRootPath}/uploads/${user}/temp/${trimFileName}${Date.now()}.xlsx`

    //make any needed directories in temp folder for user.
    await makeTempDir(uploadsFolder)
    await makeTempDir(tempFolder)
    await makeTempDir(tempPath)

    try { //begin running template request.
        if (fs.existsSync(workBookPath)) { //if template name provided by get requests exists
            const promiseList = await buildQueryList(workBookPath) //List of promises built from excel templates query sheet
            const promiseData = await Promise.all(promiseList)  //after promises run process promise data {keys: [], data: {}} FROM mongoDB
                .then((res) => {
                    return processPromiseData(res)
                })
            console.log('---running template data----1')
            const templateData = await buildTemplateData(promiseData, workBookPath) //{...sheetName {...row:{data:{}, writeRows: number, keyColumns: {}}}} from Template File
            console.log('---running template data----2')
            const workbook = new Excel.Workbook()
            await workbook.xlsx.readFile(workBookPath)
            console.log('---running template data1----3')
            for (const dataNode in templateData) { //for each worksheet
                const worksheet = workbook.getWorksheet(dataNode)
                let timeSeriesFlag = checkTimeSeriesStatus(worksheet, promiseData)  //set to 1 if worksheet contains time series data.
                if (timeSeriesFlag === 1) {
                    writeTimeSeriesSheetSingle(worksheet, dataNode, templateData)
                } else if (multiSheet !== 'true') {
                    dataPointSheetSingle(worksheet, dataNode, templateData)
                } else {
                    dataPointSheetMulti(workbook, worksheet, dataNode, templateData)
                }
            }
            console.log('---running template data1----4')
            const deleteSheet = workbook.getWorksheet('Query') ? workbook.getWorksheet('Query') : workbook.getWorksheet('query')
            if (deleteSheet.id) workbook.removeWorksheet(deleteSheet.id)
            console.log('---running template data1----5')
            await workbook.xlsx.writeFile(tempFile)
            res.status(200).sendFile(tempFile, () => {
                fs.unlinkSync(tempFile)
            })

        }
    } catch (error) {
        console.log('get/runTemplate error running excel template file', error)
        res.status(400).json({ message: "Error running excel template" }, error)
    }
})

router.post('/generateTemplate', async (req, res) => { //create and process widget derived template.
    // Post: apiKey, dashboard, widget, columnKeys <--Make this alias if available or key
    const reqData = req.body
    const apiKey = format('%L', reqData.apiKey)
    // const multiSheet = false
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
    const uploadsFolder = `${appRootPath}/uploads/`
    const tempFolder = `${appRootPath}/uploads/${user}/`
    const tempPath = `${appRootPath}/uploads/${user}/temp/`
    await makeTempDir(uploadsFolder)
    await makeTempDir(tempFolder)
    await makeTempDir(tempPath)
    const trimFileName = 'excelTemplateReturnFile'
    const tempFile = `${appRootPath}/uploads/${user}/temp/${trimFileName}${Date.now()}.xlsx`

    const newTemplate = new Excel.Workbook()
    //Query sheet templating
    const querySheet = newTemplate.addWorksheet('Query') //build query worksheet
    let security = reqData.security ? `security: "${reqData.security}"` : ''
    let visable = reqData.visable ? `visable: "${reqData.visable}"` : ''

    let queryRow = querySheet.getRow(1)
    queryRow.getCell(1).value = reqData.widget
    queryRow.getCell(2).value = `{widget(key: "${reqData.apiKey}" dashboard: "${reqData.dashboard}" widget: "${reqData.widget}" ${security} ${visable} ) {security, data}}`
    queryRow.getCell(3).value = '***ADD Columns A and B to the "Query" worksheet when designing custom excel templates***'
    queryRow.getCell(3).font = { bold: true }
    queryRow.commit()

    queryRow = querySheet.getRow(3)
    queryRow.getCell(3).value = '***ADD THE BELOW template tags TO ANY Excel sheet, not named query, in order to populate data into an excel template. ***'
    queryRow.getCell(3).font = { bold: true }
    queryRow.commit()

    //data markup tag templating
    let dataColumns = reqData.columnKeys
    queryRow = querySheet.getRow(4)
    queryRow.getCell(3).value = 'Security'
    for (const d in dataColumns) {
        queryRow.getCell(parseInt(d) + 4).value = Object.keys(dataColumns[d])[0]
    }
    queryRow.commit()
    //template data row
    queryRow = querySheet.getRow(5)
    queryRow.getCell(3).value = '&=keys.keys'
    for (let d in dataColumns) {
        queryRow.getCell(parseInt(d) + 4).value = `&=${reqData.widget}.${Object.values(dataColumns[d])[0]}`
    }
    queryRow.commit()

    //build data worksheet
    const dataSheet = newTemplate.addWorksheet('Data')
    let dataRow = dataSheet.getRow(1)
    dataRow.getCell(1).value = 'Security'
    for (const d in dataColumns) {
        dataRow.getCell(parseInt(d) + 2).value = Object.keys(dataColumns[d])[0]
    }
    dataRow.commit()
    dataRow = dataSheet.getRow(2)
    dataRow.getCell(1).value = '&=keys.keys'
    for (let d in dataColumns) {
        dataRow.getCell(parseInt(d) + 2).value = `&=${reqData.widget}.${Object.values(dataColumns[d])[0]}`
    }
    dataRow.commit()
    //  write/overwrite user dataTemplate
    await newTemplate.xlsx.writeFile(workBookName)
    const promiseList = await buildQueryList(workBookName) //List of promises built from excel templates query sheet  reqData.reducers
    const promiseData = await Promise.all(promiseList)  //after promises run process promise data {keys: [], data: {}} FROM mongoDB
        .then((res) => {
            return processPromiseData(res)
        })

    const templateData = await buildTemplateData(promiseData, workBookName) //{...sheetName {...row:{data:{}, writeRows: number, keyColumns: {}}}} from Template File
    const newWorkbook: any = new Excel.Workbook()
    await newWorkbook.xlsx.readFile(workBookName)
    for (const s in templateData) { //for each worksheet
        const worksheets = newWorkbook.getWorksheet(s)
        let timeSeriesFlag = checkTimeSeriesStatus(worksheets, promiseData)  //set to 1 if worksheet contains time series data.
        if (timeSeriesFlag === 1) {
            writeTimeSeriesSheetSingle(worksheets, s, templateData)
        } else { //if (multiSheet !== true) {
            dataPointSheetSingle(worksheets, s, templateData)
        } // else {
        //     dataPointSheetMulti(w, ws, s, templateData)
        // }
    }
    newWorkbook.views = [
        { x: 0, y: 0, height: 20000, firstSheet: 0, activeTab: 1, visability: 'visable' }
    ]
    await newWorkbook.xlsx.writeFile(tempFile)
    await res.status(200).sendFile(tempFile, () => {
        fs.unlinkSync(workBookName)
        fs.unlinkSync(tempFile)
    })
})

export default router