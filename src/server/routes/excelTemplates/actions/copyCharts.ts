import fs from 'fs';
import { makeTempDir } from './makeTempDir.js';

import copyExcelChart from 'copy-excel-chart'
import { templateData } from './buildTemplateData.js'


const readCharts = copyExcelChart.readCharts
const copyChart = copyExcelChart.copyChart
const writeCharts = copyExcelChart.writeCharts

function replaceWorksheetAlias(worksheetList: string[], excelCellRef: string, outputRef: string) {
    let newCellRef = excelCellRef
    worksheetList.forEach((ws) => {
        newCellRef = newCellRef.replace(`${ws}!`, `${ws}-${outputRef}!`)
    })

    worksheetList.forEach((ws) => {
        newCellRef = newCellRef.replace(`'${ws}'!`, `'${ws}-${outputRef}'!`)
    })

    return newCellRef
}

export default async function copyCharts(templateData: templateData, fromFile: string, toFile: string, xmlFolder: string, tempFolder: string, outputFileName: string) {

    try {

        if (!fs.existsSync(`${xmlFolder}`)) makeTempDir(`${xmlFolder}`) //location of xmls.

        const source = await readCharts(fromFile, `${xmlFolder}`)
        const output = await readCharts(toFile, `${xmlFolder}`)

        console.log('done reading charts')

        // Object.keys(templateData).forEach((sourceWorksheet) => { //for each source worksheet
        for (const sourceWorksheet of Object.keys(templateData)) {
            // console.log('WORKSHEET', sourceWorksheet)
            const outputSheets: string[] | undefined = templateData?.[sourceWorksheet]?.sheetKeys ? [...templateData[sourceWorksheet].sheetKeys] : undefined

            // if (outputSheets) outputSheets.forEach((outputWorksheetRef) => { //for sheet created from source worksheet.
            if (outputSheets) for (const outputWorksheetRef of outputSheets) {
                const outputWorksheetAlias = `${sourceWorksheet}-${outputWorksheetRef}`

                // if (source.summary()?.[sourceWorksheet]) Object.entries(source.summary()[sourceWorksheet]).forEach(async ([chart, refs]) => { // for each chart in worksheet
                const worksheetSummaryItems = Object.entries(source.summary()[sourceWorksheet])
                if (worksheetSummaryItems) for (const x of worksheetSummaryItems) { // for each chart in worksheet

                    const chart = x[0]
                    // const refs = x[0]

                    const replaceCellRefs = source.summary()[sourceWorksheet][chart].reduce((acc, ref) => {
                        return { ...acc, [ref]: replaceWorksheetAlias(Object.keys(templateData), ref, outputWorksheetRef) }
                    }, {})

                    console.log('copy chart', outputWorksheetAlias, chart)

                    await copyChart(
                        source,
                        output,
                        sourceWorksheet,
                        chart,
                        outputWorksheetAlias,
                        replaceCellRefs,
                    )

                    console.log('finish copy chart', outputWorksheetAlias, chart)
                }
            }
        }
        // console.log('FINALIZING', output, output.summary())
        const tempFileName = `${tempFolder}testFinal${Date.now() / 1000}.xlsx`
        await writeCharts(output, tempFileName)
        // console.log('done writing: ', tempFileName)
        return tempFileName
    } catch (error) {
        console.log('CopyCharts.ts - Problem copying charts: ', error)
    }
}