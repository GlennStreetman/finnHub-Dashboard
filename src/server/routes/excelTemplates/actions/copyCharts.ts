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

export default async function copyCharts(templateData: templateData, fromFile: string, toFile: string, xmlFolder: string, tempFolder: string, outputFileName: string, multiSheet: string) {

    console.log('---FINAL---', fromFile, toFile, xmlFolder, tempFolder)

    try {

        if (!fs.existsSync(`${xmlFolder}`)) makeTempDir(`${xmlFolder}`) //location of xmls.

        const source = await readCharts(fromFile, `${xmlFolder}`)
        const output = await readCharts(toFile, `${xmlFolder}`)

        if (multiSheet === 'true') {

            for (const sourceWorksheet of Object.keys(templateData)) { //for each worksheet
                console.log('SHEET KEYS', [...templateData[sourceWorksheet].sheetKeys])
                const outputSheets: string[] | undefined = templateData?.[sourceWorksheet]?.sheetKeys ? [...templateData[sourceWorksheet].sheetKeys] : undefined

                if (outputSheets) for (const outputWorksheetRef of outputSheets) { // for each associated output sheet.
                    const outputWorksheetAlias = `${sourceWorksheet}-${outputWorksheetRef}`

                    const worksheetSummaryItems = Object.entries(source.summary()[sourceWorksheet])
                    if (worksheetSummaryItems) for (const x of worksheetSummaryItems) { // for each chart in worksheet

                        const chart = x[0]

                        const replaceCellRefs = source.summary()[sourceWorksheet][chart].reduce((acc, ref) => {
                            return { ...acc, [ref]: replaceWorksheetAlias(Object.keys(templateData), ref, outputWorksheetRef) }
                        }, {})

                        console.log('copy chart -->', outputWorksheetAlias, chart, replaceCellRefs)

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
        } else {
            console.log('processing single')
            for (const sourceWorksheet of Object.keys(templateData)) { //for each worksheet
                // console.log('SHEET KEYS', [...templateData[sourceWorksheet].sheetKeys])
                // const outputSheets: string[] | undefined = templateData?.[sourceWorksheet]?.sheetKeys ? [...templateData[sourceWorksheet].sheetKeys] : undefined

                // if (outputSheets) for (const outputWorksheetRef of outputSheets) { // for each associated output sheet.
                //     const outputWorksheetAlias = `${sourceWorksheet}-${outputWorksheetRef}`

                const worksheetSummaryItems = Object.entries(source.summary()[sourceWorksheet])
                if (worksheetSummaryItems) for (const x of worksheetSummaryItems) { // for each chart in worksheet

                    const chart = x[0]
                    // console.log('copyChart', chart)
                    const replaceCellRefs = source.summary()[sourceWorksheet][chart].reduce((acc, ref) => {
                        return { ...acc, [ref]: ref }
                    }, {})

                    console.log('copy chart single -->', chart, replaceCellRefs)

                    await copyChart(
                        source,
                        output,
                        sourceWorksheet,
                        chart,
                        sourceWorksheet,
                        replaceCellRefs,
                    )

                    console.log('finish copy chart single', sourceWorksheet, chart)
                }
                // }
            }

        }

        const tempFileName = `${tempFolder}${outputFileName}${Date.now() / 1000}.xlsx`
        await writeCharts(output, tempFileName)

        return tempFileName
    } catch (error) {
        console.log('CopyCharts.ts - Problem copying charts: ', error)
    }
}