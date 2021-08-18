import xml2js from 'xml2js';
import { chartSheetObj } from '../runTemplate'
import fs from 'fs';
//traverse worbook_rels and workbook.xls to find sheeALias names, i.e. the name an excel user sees, bottom left in excel, for the worksheet.

function findChartSources(sheetRelsFile: string, dumpFolder: string, returnRels: boolean): Promise<any> { //chartRef: 'chart' | 'colors' | 'style',
    const drawing_RelsXML = fs.readFileSync(sheetRelsFile, { encoding: 'utf-8' })
    return new Promise((resolve, reject) => {
        xml2js.parseString(drawing_RelsXML, async (err, res) => {

            const relationshipList = res.Relationships.Relationship
            const resObj = {}
            for (const relation of relationshipList) {
                if (relation['$'].Target.includes('/charts/')) { //if chart relation.

                    const chartName = relation['$'].Target.replace('../charts/', '').replace('.xml', '')
                    const chart_RelsXML = fs.readFileSync(`${dumpFolder}xl/charts/_rels/${chartName}.xml.rels`, { encoding: 'utf-8' })
                    let colorSource
                    let styleSource

                    xml2js.parseString(chart_RelsXML, async (err, res) => {
                        res.Relationships.Relationship.map(el => {
                            if (el['$'].Target.includes('colors')) colorSource = el['$'].Target
                            if (el['$'].Target.includes('style')) styleSource = el['$'].Target
                            return true
                        })
                    })
                    resObj[`${chartName}`] =
                    {
                        chartSource: `${dumpFolder}xl/charts/${chartName}.xml`,
                        colorSource: `${dumpFolder}xl/charts/${colorSource}`,
                        styleSource: `${dumpFolder}xl/charts/${styleSource}`,
                        chart_RelsSource: `${dumpFolder}xl/charts/_rels/${chartName}.xml.rels`,
                    }
                }
            }
            resolve(resObj)
        })
    })
}

function findDrawingSource(sheetRelsFile: string, dumpFolder, returnRels: boolean): Promise<string> {

    const relsFile = fs.readFileSync(sheetRelsFile, { encoding: 'utf-8' })
    return new Promise((resolve, reject) => {
        xml2js.parseString(relsFile, async (err, res) => {
            const relationshipList = res.Relationships.Relationship
            for (const relation of relationshipList) {
                if (relation['$'].Target.includes('/drawings/')) {
                    const addString = relation['$'].Target.replace('../drawings/', '')
                    returnRels === true ? resolve(`${dumpFolder}xl/drawings/_rels/${addString}.rels`) : resolve(`${dumpFolder}xl/drawings/${addString}`)
                }
            }
        })
    })
}

function findWorksheetXMLTag(worksheetSource: string): Promise<string> {
    const worksheetXML = fs.readFileSync(worksheetSource, { encoding: 'utf-8' })
    return new Promise((resolve, reject) => {
        xml2js.parseString(worksheetXML, async (err, res) => {
            const tag = res.worksheet.drawing
            console.log('TAG', tag)
            resolve(tag)
        })
    })
}

function buildRelationshipObj(ID: string, dumpFolder: string, wookbookXML: string, chartSheetObj: chartSheetObj, sheetName: string) {
    // builds nested relationships in object json format.
    return new Promise((resolve, reject) => {
        xml2js.parseString(wookbookXML, async (err, res) => {
            const relationshipListSheets = res.workbook.sheets
            for (const sheet of relationshipListSheets) {
                // console.log('THIS SHEET', sheet.sheet)
                const drawSource: string = await findDrawingSource(`${dumpFolder}xl/worksheets/_rels/${sheetName}.rels`, dumpFolder, false)
                const drawRels: string = await findDrawingSource(`${dumpFolder}xl/worksheets/_rels/${sheetName}.rels`, dumpFolder, true)
                const findWorksheetXML = await findWorksheetXMLTag(`${dumpFolder}xl/worksheets/${sheetName}`)

                const newSheetObj = {
                    alias: '',
                    worksheetSource: `${dumpFolder}xl/worksheets/${sheetName}`,
                    worksheet_relsSource: `${dumpFolder}xl/worksheets/_rels/${sheetName}.rels`,
                    drawingSource: drawSource,
                    worksheetTag: findWorksheetXML,
                    drawing_relsSource: {},
                    outputSheets: []
                }

                for (const rel of sheet.sheet) { //sheet tag from workbook.xml ex: <sheet name="testName" sheetId="2" r:id="rId2"/>
                    if (rel['$']['r:id'] === ID) {
                        newSheetObj['alias'] = rel['$']['name']
                        const chartSource: string[] = await findChartSources(drawRels, dumpFolder, false)
                        newSheetObj.drawing_relsSource = { ...newSheetObj.drawing_relsSource, ...chartSource }
                    }
                }
                chartSheetObj[sheetName] = newSheetObj
            }
            resolve(true)
        })
    })
}

export const createChartSheetObj = (sheetName: string, relsXML: string, wookbookXML: string, chartSheetObj: chartSheetObj, dumpFolder: string) => {
    // console.log('WORKSHEET NAME', sheetName)
    return new Promise((resolve, reject) => {
        xml2js.parseString(relsXML, async (err, res) => {
            const relationshipList = res.Relationships.Relationship
            for (const relation of relationshipList) { //build relationship object for target sheet.
                if (relation['$'].Target === `worksheets/${sheetName}`) await buildRelationshipObj(relation['$'].Id, dumpFolder, wookbookXML, chartSheetObj, sheetName)
            }
            resolve(true)
        })
    })
}
