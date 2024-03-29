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
import {
    buildTemplateData,
    templateData,
} from "./actions/buildTemplateData.js";
import { checkTimeSeriesStatus } from "./actions/checkTimeSeriesStatus.js";
import { writeTimeSeriesSheetSingle } from "./actions/writeTimeSeriesSheetSingle.js";
import { writeTimeSeriesSheetMulti } from "./actions/writeTimeSeriesSheetMulti.js";
import { dataPointSheetSingle } from "./actions/dataPointSingle.js";
import { dataPointSheetMulti } from "./actions/dataPointSheetMulti.js";
import copyCharts from "./actions/copyCharts.js";

// import util from 'util'

const router = express.Router();

interface session {
    login: boolean;
    uID: number;
}

interface uploadTemplate extends Request {
    session: session;
    query: any;
}

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
    drawing_relsSource: drawingRelsListObj; //drawing rel file can have 1 or many relationshiups. KEY should automatical match source id after copy. Target tag needs to match new chart tag.
}

export interface chartSheetObj {
    //key is sheet. 1 sheet, 0 or 1 drawing file.
    [key: string]: sheetObj;
}

router.get("/api/runTemplate", async (req: uploadTemplate, res: any) => {
    // console.log("running template 1");

    //run user configured excel template and return result.
    const db = postgresDB;
    const apiKey = format("%L", req.query["key"]);
    const multiSheet = req.query["multi"];
    const findUser = `
        SELECT id
        FROM users
        WHERE apiKey = ${apiKey} OR apiAlias = ${apiKey}
    `;
    //copy target template into temp folder
    const userRows = await db.query(findUser);
    const user = userRows?.rows?.[0]?.id;
    const workBookPath = `${appRootPath}/uploads/${user}/${req.query.template}`; //path for template.
    const dumpFolder = `${appRootPath}/uploads/${user}/dump`;
    const tempFolder = `${appRootPath}/uploads/${user}/temp/`;
    const trimFileName = req.query.template.slice(
        0,
        req.query.template.indexOf(".xls")
    );
    const tempFile = `${appRootPath}/uploads/${user}/temp/${trimFileName}${Date.now()}.xlsx`; //path for output file.

    // console.log("running template 2");

    if (!fs.existsSync(dumpFolder)) makeTempDir(dumpFolder); //location of xmls.
    if (!fs.existsSync(tempFolder)) makeTempDir(tempFolder); //location of output worksheets.

    // console.log("running template 3");

    try {
        //begin running template request.
        if (fs.existsSync(workBookPath)) {
            // console.log("running template 4");
            //if template name provided by get requests exists

            const chartSheetsMap: chartSheetObj = {};

            const promiseList = await buildQueryList(workBookPath); //List of promises built from excel templates query sheet
            const promiseData = await Promise.all(promiseList) //after promises run process promise data {keys: [], data: {}} FROM mongoDB
                .then((res) => {
                    return processPromiseData(res);
                });
            const templateData: templateData = await buildTemplateData(
                promiseData,
                workBookPath
            ); //reads template file, returns {source:{write rows, outputSheets}}
            // console.log("running template 5");
            // console.log('templateData: ', util.inspect(templateData, { showHidden: false, depth: null, colors: true }))
            // console.log('templateData', templateData)
            const workbook = new Excel.Workbook(); //file description, used to create return excel file.
            await workbook.xlsx.readFile(workBookPath);

            // console.log("running template 6");

            for (const dataNode in templateData) {
                //for each entry
                const worksheet = workbook.getWorksheet(dataNode);
                let timeSeriesFlag: boolean = checkTimeSeriesStatus(
                    worksheet,
                    promiseData
                ); //Checks worksheet to see if it contains time series data. Returns 1 if time series found.
                if (timeSeriesFlag === true) {
                    multiSheet !== `true`
                        ? writeTimeSeriesSheetSingle(
                              worksheet,
                              dataNode,
                              templateData
                          )
                        : writeTimeSeriesSheetMulti(
                              workbook,
                              worksheet,
                              dataNode,
                              templateData,
                              chartSheetsMap
                          );
                } else {
                    multiSheet !== `true`
                        ? dataPointSheetSingle(
                              worksheet,
                              dataNode,
                              templateData
                          )
                        : dataPointSheetMulti(
                              workbook,
                              worksheet,
                              dataNode,
                              templateData,
                              chartSheetsMap
                          );
                }
            }

            // console.log("running template 7");

            //delete the query sheet
            const deleteSheet = workbook.getWorksheet("Query")
                ? workbook.getWorksheet("Query")
                : workbook.getWorksheet("query");
            if (deleteSheet?.id) workbook.removeWorksheet(deleteSheet.id);

            // console.log("running template 8");

            await workbook.xlsx.writeFile(tempFile); //source temp file.
            const outputFileName = await copyCharts(
                templateData,
                workBookPath,
                tempFile,
                dumpFolder,
                tempFolder,
                trimFileName,
                multiSheet
            );

            // console.log("running template 9");
            res.status(200).sendFile(outputFileName, () => {
                // fs.unlinkSync(tempFile)
            });
        }
    } catch (error) {
        console.log("get/runTemplate error running excel template file", error);
        res.status(400).json({ message: "Error running excel template" });
    }
});

export default router;
