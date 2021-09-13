import { templateData } from './buildTemplateData'
import { printTemplateWorksheets } from './printTemplateWorksheets.js'
import { chartSheetObj } from './../runTemplate'

export const dataPointSheetMulti = function (workbook, worksheet, dataNode, templateData: templateData, chartSheets: chartSheetObj) {

    let rowIterator = 0 //if multiSheet = 'false: add 1 for each line written so that writer doesnt fall out of sync with file.
    printTemplateWorksheets(workbook, dataNode, templateData[dataNode].sheetKeys, worksheet, chartSheets) //create new worksheets for each security
    const templateWorksheet = templateData[dataNode]
    const sheetKeys = templateWorksheet.sheetKeys
    for (const sheetKey of sheetKeys) { //for each security
        const thisWorkSheet = workbook.getWorksheet(`${dataNode}-${sheetKey}`) //get the worksheet to be updated.
        for (const row in templateWorksheet) { // for each TEMPLATE row in worksheet. This operation will almost always add rows to return file.
            const keyColumns = templateWorksheet[row].keyColumns
            if (templateWorksheet[row].data) { //if data is present its the skeet keys entry.
                for (const dataPoint in templateWorksheet[row].data) {
                    const point = templateWorksheet[row].data[dataPoint]
                    const findData = keyColumns[`${dataPoint}`] ? sheetKey : point[sheetKey] //if key column, return key, else return data.
                    thisWorkSheet.getRow(parseInt(row) + rowIterator).getCell(parseInt(dataPoint)).value = findData
                    worksheet.getRow(row + rowIterator).commit()
                }
            }
        }
    }
    workbook.removeWorksheet(worksheet.id) //remove the source worksheet
}