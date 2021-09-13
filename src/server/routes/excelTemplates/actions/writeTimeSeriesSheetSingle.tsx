import { templateData } from './buildTemplateData'

export const writeTimeSeriesSheetSingle = function (ws, datanode, templateData: templateData) {
    let rowIterator = 0 //if multiSheet = 'false: add 1 for each line written so that writer doesnt fall out of sync with file.
    const templateWorksheet = templateData[datanode]

    const addedRows: number[] = [] //if multiSheet = 'false: list of rows added to template. Used to adjust any excel formulas as they dont auto update when adding rows.
    for (const row in templateWorksheet) { // for each TEMPLATE row in worksheet. This operation will add rows = time series count X number of securities.
        const dataRow = templateWorksheet[row].data //list of rows to be updated from template file. 
        const writeRows = templateWorksheet[row].writeRows && Object.entries(templateWorksheet[row].writeRows).length ? Object.entries(templateWorksheet[row].writeRows).length : 0 //used to create range of rows we need to  update.
        const keyColumns = templateWorksheet[row].keyColumns //list of key columns for each row. {...integers: integer}
        let currentKey = '' //the current security key
        let currKeyColumn = '' //ref to the source of current security key
        for (let step = 1; step <= writeRows; step++) { //iterate over new rows that data will populate into
            let timeSeriesFlag = 1
            let startRow = 0 //saves the start line for time series data
            let dataRowCount = 0 //number of rows to enter data for time series
            for (const updateCell in dataRow) { //{...rowInteger: {...security || key Integer: value || timeSeries{}}}
                if (keyColumns[updateCell]) {  //update if key column integer. If security this test will fail as security ref is string.
                    currentKey = dataRow?.[updateCell]?.[step - 1]
                    currKeyColumn = updateCell //Whenever a key value is in a cell update keyColumn. That way multiple keys can exist in the same row.
                    if (dataRow[updateCell][step - 1] && typeof dataRow[updateCell][step - 1] === 'string') {
                        ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = dataRow[updateCell][step - 1]
                    }
                } else if (typeof dataRow[updateCell][currentKey] !== 'object') {
                    if (ws !== undefined) ws.getRow(parseInt(row) + rowIterator).getCell(parseInt(updateCell)).value = dataRow[updateCell][currentKey]
                } else {
                    const dataGroup = dataRow[updateCell][currentKey]
                    if (timeSeriesFlag === 1) { //only run once.
                        timeSeriesFlag = 2;
                        startRow = typeof rowIterator === 'string' ? parseInt(rowIterator) : rowIterator
                        dataRowCount = Object.keys(dataGroup).length
                        for (let i = 1; i <= dataRowCount; i++) {
                            let newRow = parseInt(row) + rowIterator + i
                            ws.insertRow(newRow).commit()
                            addedRows.push(newRow)
                        }
                        rowIterator = rowIterator + dataRowCount
                    }
                    for (let d = 0; d < dataRowCount; d++) { //enter data for column
                        const key = Object.keys(dataGroup)[d]
                        ws.getRow(startRow + d + 2).getCell(parseInt(updateCell)).value = dataGroup[key]
                        ws.getRow(startRow + d + 2).getCell(parseInt(currKeyColumn)).value = currentKey
                        ws.getRow(startRow + d + 2).commit()
                    }
                }
            }
        }
    }

    ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        //update all formula cells. Offset their row references by number of rows added before or inside of formula range.
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