import express from "express";
import appRootPath from "app-root-path";
import fs from "fs";
import format from "pg-format";
import Excel from "exceljs";
import postgresDB from "../../db/databaseLocalPG.js";

//import template actions
import { buildQueryList } from "./actions/buildQueryList.js";
import { processPromiseData } from "./actions/processPromiseData.js";
import { makeTempDir } from "./actions/makeTempDir.js";
import { buildTemplateData } from "./actions/buildTemplateData.js";
import { checkTimeSeriesStatus } from "./actions/checkTimeSeriesStatus.js";
import { writeTimeSeriesSheetSingle } from "./actions/writeTimeSeriesSheetSingle.js";
import { dataPointSheetSingle } from "./actions/dataPointSingle.js";

const router = express.Router();

interface drawingrelsObj {
    chartSource: string;
    colorSource: string;
    styleSource: string;
    chart_RelsSource: string;
}

export interface drawingRelsListObj {
    //key should be target
    [key: string]: drawingrelsObj;
}

interface sheetObj {
    //1 sheet 1 drawing xml, but 1 or many chart/color/style xmls.
    alias: string;
    outputSheets: string[];
    worksheetSource: string;
    worksheet_relsSource: string; //drawing tag in worksheet xml is standard <drawing r:id="rId1"/> 1 tag for each _rel <Relationship/> added to end of xml. Target= needs to match new drawing source.
    worksheetTag: string;
    drawingSource: string;
    drawing_relsSource: drawingRelsListObj; //drawing rel file cane have 1 or many relationshiups. KEY should automatical match source id after copy. Target tag needs to match new chart tag.
}

export interface chartSheetObj {
    //key is sheet. 1 sheet, 0 or 1 drawing file.
    [key: string]: sheetObj;
}

router.post("/api/generateTemplate", async (req, res) => {
    //create and process widget derived template.
    const db = postgresDB;
    // Post: apiKey, dashboard, widget, columnKeys <--Make this alias if available or key
    const reqData = req.body;
    const apiKey = format("%L", reqData.apiKey);
    // const multiSheet = false
    const findUser = `
        SELECT id
        FROM users
        WHERE apiKey = ${apiKey} OR apiAlias = ${apiKey}
    `;
    //copy target template into temp folder
    const userRows = await db.query(findUser);
    const user = userRows?.rows?.[0]?.id;

    const workBookPath = `${appRootPath}/uploads/${user}/temp/excelTemplate${Date.now()}`;
    const workBookName = workBookPath + ".xlsx";
    const uploadsFolder = `${appRootPath}/uploads/`;
    const tempFolder = `${appRootPath}/uploads/${user}/`;
    const tempPath = `${appRootPath}/uploads/${user}/temp/`;
    await makeTempDir(uploadsFolder);
    await makeTempDir(tempFolder);
    await makeTempDir(tempPath);
    const trimFileName = "excelTemplateReturnFile";
    const tempFile = `${appRootPath}/uploads/${user}/temp/${trimFileName}${Date.now()}.xlsx`;

    const newTemplate = new Excel.Workbook();
    //Query sheet templating
    const querySheet = newTemplate.addWorksheet("Query"); //build query worksheet
    let security = reqData.security ? `security: "${reqData.security}"` : "";
    let visable = reqData.visable ? `visable: "${reqData.visable}"` : "";

    let queryRow = querySheet.getRow(1);
    queryRow.getCell(1).value = reqData.widget;
    queryRow.getCell(
        2
    ).value = `{widget(key: "${reqData.apiKey}" dashboard: "${reqData.dashboard}" widget: "${reqData.widget}" ${security} ${visable} ) {security, data}}`;
    queryRow.getCell(3).value =
        '***ADD Columns A and B to the "Query" worksheet when designing custom excel templates***';
    queryRow.getCell(3).font = { bold: true };
    queryRow.commit();

    queryRow = querySheet.getRow(3);
    queryRow.getCell(3).value =
        "***ADD THE BELOW template tags TO ANY Excel sheet, not named query, in order to populate data into an excel template. ***";
    queryRow.getCell(3).font = { bold: true };
    queryRow.commit();

    //data markup tag templating
    let dataColumns = reqData.columnKeys;
    queryRow = querySheet.getRow(4);
    queryRow.getCell(3).value = "Security";
    for (const d in dataColumns) {
        queryRow.getCell(parseInt(d) + 4).value = Object.keys(
            dataColumns[d]
        )[0];
    }
    queryRow.commit();
    //template data row
    queryRow = querySheet.getRow(5);
    queryRow.getCell(3).value = "&=keys.keys";
    for (let d in dataColumns) {
        queryRow.getCell(parseInt(d) + 4).value = `&=${reqData.widget}.${
            Object.values(dataColumns[d])[0]
        }`;
    }
    queryRow.commit();

    //build data worksheet
    const dataSheet = newTemplate.addWorksheet("Data");
    let dataRow = dataSheet.getRow(1);
    dataRow.getCell(1).value = "Security";
    for (const d in dataColumns) {
        dataRow.getCell(parseInt(d) + 2).value = Object.keys(dataColumns[d])[0];
    }
    dataRow.commit();
    dataRow = dataSheet.getRow(2);
    dataRow.getCell(1).value = "&=keys.keys";
    for (let d in dataColumns) {
        dataRow.getCell(parseInt(d) + 2).value = `&=${reqData.widget}.${
            Object.values(dataColumns[d])[0]
        }`;
    }
    dataRow.commit();
    //  write/overwrite user dataTemplate
    await newTemplate.xlsx.writeFile(workBookName);
    const promiseList = await buildQueryList(workBookName); //List of promises built from excel templates query sheet  reqData.reducers
    const promiseData = await Promise.all(promiseList) //after promises run process promise data {keys: [], data: {}} FROM mongoDB
        .then((res) => {
            return processPromiseData(res);
        });
    const templateData = await buildTemplateData(promiseData, workBookName); //{...sheetName {...row:{data:{}, writeRows: number, keyColumns: {}}}} from Template File
    console.log("templateData", templateData);
    const newWorkbook: any = new Excel.Workbook();
    await newWorkbook.xlsx.readFile(workBookName);
    for (const dataNode in templateData) {
        //for each worksheet
        const worksheets = newWorkbook.getWorksheet(dataNode);
        let timeSeriesFlag = checkTimeSeriesStatus(worksheets, promiseData); //set to 1 if worksheet contains time series data.
        if (timeSeriesFlag === true) {
            writeTimeSeriesSheetSingle(worksheets, dataNode, templateData);
        } else {
            dataPointSheetSingle(worksheets, dataNode, templateData);
        }
    }
    newWorkbook.views = [
        {
            x: 0,
            y: 0,
            height: 20000,
            firstSheet: 0,
            activeTab: 1,
            visability: "visable",
        },
    ];
    await newWorkbook.xlsx.writeFile(tempFile);

    await res.status(200).sendFile(tempFile, () => {
        fs.unlinkSync(workBookName);
        fs.unlinkSync(tempFile);
    });
});

export default router;
