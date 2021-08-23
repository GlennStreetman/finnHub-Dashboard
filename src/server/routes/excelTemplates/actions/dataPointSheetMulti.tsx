import { templateData } from './buildTemplateData'
import { printTemplateWorksheets } from './printTemplateWorksheets.js'
import { chartSheetObj } from './../runTemplate'

export const dataPointSheetMulti = function (workbook, worksheet, dataNode, templateData: templateData, chartSheets: chartSheetObj) {
    // console.log('---PROCESSING MULTI---', templateData[dataNode])
    let rowIterator = 0 //if multiSheet = 'false: add 1 for each line written so that writer doesnt fall out of sync with file.
    printTemplateWorksheets(workbook, dataNode, templateData[dataNode].sheetKeys, worksheet, chartSheets) //create new worksheets for each security
    const templateWorksheet = templateData[dataNode]
    for (const row in templateWorksheet) { // for each TEMPLATE row in worksheet. This operation will almost always add rows to return file.
        const dataRow = templateWorksheet[row].data //list of rows to be updated from template file. 
        const writeRows = templateWorksheet[row].writeRows //used to create range of rows we need to  update.
        const keyColumns = templateWorksheet[row].keyColumns //list of key columns for each row. {...integers: integer}
        let currentKey = '' //the current security key
        for (let step = 1; step <= writeRows; step++) { //iterate over new rows that data will populate into
            for (const updateCell in dataRow) { //{...rowInteger: {...security || key Integer: value || timeSeries{}}}
                if (keyColumns[updateCell]) {
                    currentKey = dataRow?.[updateCell]?.[step - 1]
                    const thisWorkSheet = workbook.getWorksheet(`${dataNode}-${currentKey}`)
                    if (dataRow[updateCell][step - 1] && typeof dataRow[updateCell][step - 1] === 'string') {
                        thisWorkSheet.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = dataRow[updateCell][step - 1]
                        // console.log('Key', parseInt(row), 'Cell', parseInt(updateCell), dataRow[updateCell][step - 1])
                    }
                } else { //update data point cells.
                    const thisWorkSheet = workbook.getWorksheet(`${dataNode}-${currentKey}`)
                    if (thisWorkSheet !== undefined) thisWorkSheet.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = dataRow[updateCell][currentKey]
                    // console.log('Row', parseInt(row), 'Cell', parseInt(updateCell), dataRow[updateCell][currentKey])
                }
            }
            worksheet.getRow(row + rowIterator).commit()
        }
    }
    workbook.removeWorksheet(worksheet.id)
}