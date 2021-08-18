import Excel from 'exceljs';
import { getDataSlice } from './getDataSlice.js'
// import { GQLReqObj } from './getGraphQLData.js'
import { processedPromiseData } from './processPromiseData.js'

interface thisRow {
    data: Object,
    writeRows: number,
    keyColumns: Object
}

interface worksheetData {
    sheetKeys: Set<string>,
    [key: number]: thisRow
}

export interface templateData {
    [key: string]: worksheetData
}

async function buildTemplateData(promiseData: processedPromiseData, workBookPath: string): Promise<templateData> {
    //transform promise data
    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(workBookPath)
    const templateData = {}
    wb.eachSheet((worksheet) => { //for each worksheet not named Query.
        if (worksheet.name !== 'Query') {
            templateData[worksheet.name] = { sheetKeys: new Set() } //sheet keys used in case data points need to be split into multiple worksheets.
            worksheet.eachRow((row, rowNumber) => {
                const thisRow = {
                    data: {},
                    writeRows: 0, //if zero skip in later steps. Used for inserting new rows if greater than 1.
                    keyColumns: {}, //list of columns where key needs to be updated.
                }
                for (const x in row.values) {
                    if (typeof row?.values?.[x] === 'string' && row?.values?.[x]?.slice(0, 2) === '&=') { //if template formula detected.
                        const searchStringRaw = row.values[x]
                        const searchString = searchStringRaw.slice(2, searchStringRaw.length)
                        if (searchString !== 'keys.keys') { //if data column
                            const dataObj = getDataSlice(promiseData, searchString) //could {key: string} pairs OR {key: OBJECT} pairs
                            for (const s in dataObj) {
                                templateData[worksheet.name]['sheetKeys'].add(s)
                                if (typeof dataObj[s] === 'object') { //count number of rows if time series data in dataset.
                                    thisRow.writeRows = thisRow.writeRows + Object.keys(dataObj[s]).length
                                }
                            }
                            if (Object.keys(dataObj).length > thisRow.writeRows) { thisRow.writeRows = Object.keys(dataObj).length }
                            thisRow.data[x] = dataObj
                        } else { //if key column
                            thisRow.data[x] = { ...promiseData.keys }
                            thisRow.keyColumns[x] = x
                        }
                    }
                }
                templateData[worksheet.name][rowNumber] = thisRow
            })
        }
    })

    return templateData //object describing data that needs to be populated with data.
}

export { buildTemplateData }