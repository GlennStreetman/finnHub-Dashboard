import { templateData } from './buildTemplateData'
import { printTemplateWorksheets } from './printTemplateWorksheets.js'
import { chartSheetObj } from '../runTemplate'

export const writeTimeSeriesSheetMulti = function (workbook, sourceWorksheet, datanode = 'data', templateData: templateData, chartSheets: chartSheetObj) {
    printTemplateWorksheets(workbook, datanode, templateData[datanode].sheetKeys, sourceWorksheet, chartSheets) //create new worksheets for each security
    let rowIterator = 0 //if multiSheet = 'false: add 1 for each line written so that writer doesnt fall out of sync with file.
    const templateWorksheet = templateData[datanode]

    const addedRows: number[] = []
    for (const row in templateWorksheet) { //rows are references to original template. templateWorksheet[row].data === 
        const dataRow = templateWorksheet[row].data //{[key: int]: string[]} Each key is an integer, and a reference to a column
        const writeRows = templateWorksheet[row].writeRows //Number reference to the number of rows to be written..
        const keyColumns = templateWorksheet[row].keyColumns //list of columns that contain key.key references. i.e. securitie tags.
        let currentKey = '' //the current security key
        let currKeyColumn = '' //ref to the source of current security key
        let thisWorksheet //varaible setup to be workbook.getWorksheet().
        for (let step = 1; step <= writeRows; step++) { //iterate over each row specified in writrows.
            let timeSeriesFlag = 1
            let startRow = 0 //saves the start line for time series data
            let dataRowCount = 0 //number of rows to enter data for time series
            for (const column in dataRow) {
                if (keyColumns[column] !== undefined) { //if update column
                    // if (currentKey !== '' && currentKey !== dataRow?.[column]?.[step - 1]) { startRow = 0; console.log('new key startrow') }
                    currentKey = dataRow?.[column]?.[step - 1]
                    currKeyColumn = column
                    thisWorksheet = workbook.getWorksheet(`${datanode}-${currentKey}`)
                    if (dataRow[column][step - 1] && typeof dataRow[column][step - 1] === 'string') {
                        thisWorksheet.getRow(parseInt(row) + rowIterator).getCell(parseInt(column)).value = dataRow[column][step - 1]
                    }
                } else if (typeof dataRow[column][currentKey] !== 'object') {
                    if (thisWorksheet !== undefined) thisWorksheet.getRow(parseInt(row) + rowIterator).getCell(parseInt(column)).value = dataRow[column][currentKey]
                }
                else {
                    const dataGroup = dataRow[column][currentKey]
                    // console.log('dataGroup', currentKey, currKeyColumn, timeSeriesFlag, 'startrow', startRow, dataRowCount) //<--shows iteration of function
                    if (timeSeriesFlag === 1) { //only run once.
                        timeSeriesFlag = 2;
                        // startRow = typeof rowIterator === 'string' ? parseInt(rowIterator) : rowIterator
                        dataRowCount = Object.keys(dataGroup).length
                        for (let i = 1; i <= dataRowCount; i++) {
                            let newRow = parseInt(row) + rowIterator + i
                            thisWorksheet.insertRow(newRow).commit()
                            addedRows.push(newRow)
                        }
                        rowIterator = rowIterator + dataRowCount
                    }
                    thisWorksheet = workbook.getWorksheet(`${datanode}-${currentKey}`)
                    for (let d = 0; d < dataRowCount; d++) { //enter cell data for current worksheet
                        const key = Object.keys(dataGroup)[d]
                        thisWorksheet.getRow(startRow + d + 2).getCell(parseInt(column)).value = dataGroup[key]
                        thisWorksheet.getRow(startRow + d + 2).getCell(parseInt(currKeyColumn)).value = currentKey
                        thisWorksheet.getRow(startRow + d + 2).commit()
                    }
                }
            }
        }
    }

    for (const s of templateData[datanode].sheetKeys) { //update all formula cells. Offset their row references by number of rows added before or inside of formula range.
        const ws = workbook.getWorksheet(`${datanode}-${s}`)
        ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                if (typeof cell.value === 'object') { //if excel formula
                    let updateString = cell.value.formula
                    let updateList: string[] = []
                    let re = new RegExp(/(?:^|[^0-9])([A-Z](?:100|[0-9][0-9]?))(?=$|[^0-9A-Z])/g)
                    let allMatches: string[] = cell?.value?.formula?.matchAll(re) ? [...cell.value.formula.matchAll(re)] : []
                    for (const m in allMatches) {
                        let matchRow: number = parseInt(allMatches[m][1].replace(new RegExp(/\D/g), '')) //remove all none digits.
                        let matchColumn: string = allMatches[m][1].replace(new RegExp(/[0-9]/g), '') //remove all digits
                        for (const r in addedRows) {
                            if (matchRow >= addedRows[r]) matchRow = matchRow + 1
                        }
                        const updateRef = matchColumn + matchRow
                        updateList.unshift(allMatches[m][1], updateRef) //update row values in reverse order so you dont double update starting row.
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
    workbook.removeWorksheet(sourceWorksheet.id)
}

