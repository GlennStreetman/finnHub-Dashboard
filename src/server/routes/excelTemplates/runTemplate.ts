import express from 'express';
import appRootPath from 'app-root-path'
import fs from 'fs';
import format from "pg-format";
import Excel from 'exceljs';
import AdmZip from 'adm-zip';
import dbLive from "../../db/databaseLive.js"
import devDB from "../../db/databaseLocalPG.js"

//import template actions
import { buildQueryList } from './actions/buildQueryList.js'
import { processPromiseData } from './actions/processPromiseData.js'
import { makeTempDir } from './actions/makeTempDir.js';
import { buildTemplateData, templateData } from './actions/buildTemplateData.js'
import { checkTimeSeriesStatus } from './actions/checkTimeSeriesStatus.js'
import { writeTimeSeriesSheetSingle } from './actions/writeTimeSeriesSheetSingle.js'
import { writeTimeSeriesSheetMulti } from './actions/writeTimeSeriesSheetMulti.js'
import { dataPointSheetSingle } from './actions/dataPointSingle.js'
import { dataPointSheetMulti } from './actions/dataPointSheetMulti.js'
import { createChartSheetObj } from './actions/createChartSheetObj.js'
import { copyAllChartsSingle } from './actions/copyAllChartsSingle.js'
import { copyAllChartsMulti } from './actions/copyAllChartsMulti.js'

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

interface drawingrelsObj {
    chartSource: string
    colorSource: string
    styleSource: string
    chart_RelsSource: string
}

export interface drawingRelsListObj { //key should be target
    [key: string]: drawingrelsObj
}

interface sheetObj { //1 sheet 1 drawing xml, but 1 or many chart/color/style xmls.
    alias: string
    outputSheets: string[]
    worksheetSource: string
    worksheet_relsSource: string //drawing tag in worksheet xml is standard <drawing r:id="rId1"/> 1 tag for each _rel <Relationship/> added to end of xml. Target= needs to match new drawing source.
    worksheetTag: string
    drawingSource: string
    drawing_relsSource: drawingRelsListObj //drawing rel file cane have 1 or many relationshiups. KEY should automatical match source id after copy. Target tag needs to match new chart tag.

}

export interface chartSheetObj { //key is sheet. 1 sheet, 0 or 1 drawing file.
    [key: string]: sheetObj
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
    const workBookPath = `${appRootPath}/uploads/${user}/${req.query.template}` //path for template.
    const uploadsFolder = `${appRootPath}/uploads/`
    const tempFolder = `${appRootPath}/uploads/${user}/`
    const dumpFolder = `${appRootPath}/uploads/${user}/dump`
    const dumpFolderSource = `${appRootPath}/uploads/${user}/dump/source/`
    const dumpFolderOutput = `${appRootPath}/uploads/${user}/dump/output/`
    const tempPath = `${appRootPath}/uploads/${user}/temp/`
    const trimFileName = req.query.template.slice(0, req.query.template.indexOf('.xls'))
    const tempFile = `${appRootPath}/uploads/${user}/temp/${trimFileName}${Date.now()}.xlsx` //path for output file.

    //make any needed directories in temp folder for user.
    makeTempDir(uploadsFolder)
    makeTempDir(tempFolder)
    makeTempDir(dumpFolder)
    fs.rmdirSync(dumpFolderSource, { recursive: true });
    fs.rmdirSync(dumpFolderOutput, { recursive: true });
    makeTempDir(dumpFolderSource)
    makeTempDir(dumpFolderOutput)
    makeTempDir(tempPath)

    try { //begin running template request.
        if (fs.existsSync(workBookPath)) { //if template name provided by get requests exists
            // //create list of source charts.
            const chartSheetsMap: chartSheetObj = {}
            const zip = new AdmZip(workBookPath)
            zip.extractAllTo(dumpFolderSource, true) //unzip excel template file to dump folder.
            let filenames = fs.readdirSync(`${dumpFolderSource}/xl/worksheets/`);
            console.log('filenames', filenames)
            filenames.forEach((fileName) => { //for each worksheet in worksheet dir.
                const fileNamePath = `${dumpFolderSource}/xl/worksheets/${fileName}`
                if (fs.existsSync(fileNamePath) && fs.lstatSync(fileNamePath).isDirectory() === false) { //with file extension, not path.
                    const thisWorksheetText = fs.readFileSync(fileNamePath, { encoding: 'utf-8' })
                    if (thisWorksheetText.includes('<drawing')) { //If worksheet includes a <drawing /> tag then it has charts.
                        const workbookXML_rels = fs.readFileSync(`${dumpFolderSource}/xl/_rels/workbook.xml.rels`, { encoding: 'utf-8' })
                        const wookbookXML = fs.readFileSync(`${dumpFolderSource}/xl/workbook.xml`, { encoding: 'utf-8' })
                        createChartSheetObj(fileName, workbookXML_rels, wookbookXML, chartSheetsMap, dumpFolderSource) //
                    }
                }
            });

            const promiseList = await buildQueryList(workBookPath) //List of promises built from excel templates query sheet
            const promiseData = await Promise.all(promiseList)  //after promises run process promise data {keys: [], data: {}} FROM mongoDB
                .then((res) => {
                    return processPromiseData(res)
                })
            const templateData: templateData = await buildTemplateData(promiseData, workBookPath) //reads template file, returns {source:{write rows, outputSheets}}
            const sourceWorksheets: string[] = Object.keys(templateData) //list of source worksheets
            const workbook = new Excel.Workbook() //file description, used to create return excel file.
            await workbook.xlsx.readFile(workBookPath)

            for (const dataNode in templateData) { //for each worksheet
                const worksheet = workbook.getWorksheet(dataNode)
                let timeSeriesFlag: boolean = checkTimeSeriesStatus(worksheet, promiseData)  //Checks worksheet to see if it contains time series data. Returns 1 if time series found.
                if (timeSeriesFlag === true) {
                    multiSheet !== `true` ?
                        writeTimeSeriesSheetSingle(worksheet, dataNode, templateData) :
                        writeTimeSeriesSheetMulti(workbook, worksheet, dataNode, templateData, chartSheetsMap)
                } else {
                    multiSheet !== `true` ?
                        dataPointSheetSingle(worksheet, dataNode, templateData) :
                        dataPointSheetMulti(workbook, worksheet, dataNode, templateData, chartSheetsMap)
                }
            }

            //delete the query sheet
            const deleteSheet = workbook.getWorksheet('Query') ? workbook.getWorksheet('Query') : workbook.getWorksheet('query')
            if (deleteSheet.id) workbook.removeWorksheet(deleteSheet.id)

            await workbook.xlsx.writeFile(tempFile)

            const outputFile = multiSheet !== `true` ?
                await copyAllChartsSingle(tempFile, dumpFolderSource, dumpFolderOutput, chartSheetsMap) :
                await copyAllChartsMulti(tempFile, dumpFolderSource, dumpFolderOutput, chartSheetsMap, sourceWorksheets)
            console.log('Sending output file')
            res.status(200).sendFile(outputFile, () => {
                fs.unlinkSync(tempFile)
            })

        }
    } catch (error) {
        console.log('get/runTemplate error running excel template file', error)
        res.status(400).json({ message: "Error running excel template" }, error)
    }
})


export default router