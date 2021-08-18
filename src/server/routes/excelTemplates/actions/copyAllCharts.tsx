
import AdmZip from 'adm-zip';
import xml2js from 'xml2js';
import fs from 'fs';
import util from 'util'

import { chartSheetObj, drawingRelsListObj } from '../runTemplate'

// const findOverrides = async (overrideObj, dumpFolder, outputFolder) => {
//     const readOverrides = await fs.readFileSync(`${dumpFolder}/[Content_Types].xml`, { encoding: 'utf-8' })
//     await xml2js.parseString(readOverrides, async (err, res) => {
//         overrideObj = { ...res.Types.Override }
//         return true
//     })
//     fs.copyFileSync(`${dumpFolder}/[Content_Types].xml`, `${outputFolder}/[Content_Types].xml`)
// }

const copyWorksheetRelationFile = (worksheetName, chartSheetsMap, outputFolder) => {
    fs.copyFile(chartSheetsMap[worksheetName].worksheet_relsSource, `${outputFolder}/xl/worksheets/_rels/${worksheetName}.rels`, (err) => {
        if (err) { console.log(err) } else { console.log(`copied worksheet rel ${worksheetName}.rels`) }
    })
}

const addWorksheetDrawingsTag = (worksheetName: string, chartSheetsMap: chartSheetObj, outputFolder: string): Promise<boolean> => {
    const tag = chartSheetsMap[worksheetName].worksheetTag
    const worksheetXML = fs.readFileSync(`${outputFolder}/xl/worksheets/${worksheetName}`, { encoding: 'utf-8' })
    return new Promise((resolve, reject) => {
        xml2js.parseString(worksheetXML, async (err, res) => {
            if (err) {
                console.log(err)
            } else {
                res.worksheet.drawing = tag
                const builder = new xml2js.Builder()
                const xml = builder.buildObject(res)
                fs.writeFile(`${outputFolder}/xl/worksheets/${worksheetName}`, xml, (err) => { if (err) console.log(err) })
                resolve(true)
            }
        })
    })
}

const copyDrawingRelationFiles = (worksheetName, chartSheetsMap, outputFolder, dumpFolderSource) => {
    return new Promise((resolve, reject) => {
        const copyFileName = chartSheetsMap[worksheetName].drawingSource.replace(`${dumpFolderSource}xl/drawings/`, '')
        const relsPath = chartSheetsMap[worksheetName].drawingSource.replace(copyFileName, '')
        const from = `${relsPath}_rels/${copyFileName}.rels`
        const too = `${outputFolder}/xl/drawings/_rels/${copyFileName}.rels`
        fs.copyFile(from, too, (err) => {
            if (err) {
                console.log('copy drawing error: FROM:', fs.existsSync(from), 'TOO:', fs.existsSync(`${outputFolder}/xl/drawings/`), 'ERR:', err)
                reject(err)
            } else {
                console.log(`copied drawings rel ${worksheetName}.rels`)
            }
            resolve(true)
        })
    })
}

const copyDrawingFiles = (worksheetName, chartSheetsMap, outputFolder, dumpFolderSource) => {
    return new Promise((resolve, reject) => {
        const copyFileName = chartSheetsMap[worksheetName].drawingSource.replace(`${dumpFolderSource}xl/drawings/`, '')
        const relsPath = chartSheetsMap[worksheetName].drawingSource.replace(copyFileName, '')
        fs.copyFile(`${relsPath}/${copyFileName}`, `${outputFolder}/xl/drawings/${copyFileName}`, (err) => {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                console.log(`copied drawings ${worksheetName}.rels`)
            }
            resolve(true)
        })
    })
}

const copyFilePromise = util.promisify(fs.copyFile);

const copyChartFiles = (worksheetName, chartSheetsMap, outputFolder, dumpFolderSource) => {
    return new Promise((resolve, reject) => {
        const chartObj: drawingRelsListObj = chartSheetsMap[worksheetName].drawing_relsSource
        const copyList: Promise<any>[] = []
        Object.values(chartObj).map((v) => {
            const copyChartName = v.chartSource.replace(`${dumpFolderSource}xl/charts/`, '')
            const copyColorsName = v.colorSource.replace(`${dumpFolderSource}xl/charts/`, '')
            const copyStyleName = v.styleSource.replace(`${dumpFolderSource}xl/charts/`, '')
            console.log('---NAMES---', copyChartName, copyColorsName, copyStyleName, `${dumpFolderSource}xl/charts/`)
            copyList.push(copyFilePromise(v.chartSource, `${outputFolder}/xl/charts/${copyChartName}`)) //copy chart
            copyList.push(copyFilePromise(v.colorSource, `${outputFolder}/xl/charts/${copyColorsName}`)) //copy color
            copyList.push(copyFilePromise(v.styleSource, `${outputFolder}/xl/charts/${copyStyleName}`)) //copy styles
            copyList.push(copyFilePromise(v.chart_RelsSource, `${outputFolder}/xl/charts/_rels/${copyChartName}.rels`)) //copy _rels
            return true
        })
        Promise.all(copyList).then(() => {
            resolve(true)
        })

    })
}



export const copyAllChartsSingle = async function (targetFile: string, dumpFolderSource, outputFolder, chartSheetsMap: chartSheetObj): Promise<string> {

    return new Promise(async (resolve, reject) => {

        const unZip = new AdmZip(targetFile)
        unZip.extractAllTo(outputFolder, true) //unzip excel template file to dump folder.

        if (!fs.existsSync(`${outputFolder}/xl/worksheets/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/worksheets/_rels/`, { recursive: true })
        if (!fs.existsSync(`${outputFolder}/xl/drawings/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/drawings/_rels/`, { recursive: true })
        if (!fs.existsSync(`${outputFolder}/xl/charts/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/charts/_rels/`, { recursive: true })


        Object.keys(chartSheetsMap).map(async (k) => { //promise all these file operations. Make sure each promise throws an error if failed.
            //sheet functions
            copyWorksheetRelationFile(k, chartSheetsMap, outputFolder)//copy relation file
            await addWorksheetDrawingsTag(k, chartSheetsMap, outputFolder)//add drawing tag.
            //drawing functions
            await copyDrawingRelationFiles(k, chartSheetsMap, outputFolder, dumpFolderSource)
            await copyDrawingFiles(k, chartSheetsMap, outputFolder, dumpFolderSource)
            //chart functions && rename formula sheet refs.
            copyChartFiles(k, chartSheetsMap, outputFolder, dumpFolderSource)

            //DONT FORGET TO REGISTER content types if new sheets created
            //rezip file, retun string ref.
            const zip = new AdmZip();
            const outputFilename = outputFolder.replace('output/', 'final.xlsx')
            console.log('outputFilename', outputFilename)
            zip.addLocalFolder(outputFolder, '')
            zip.writeZip(outputFilename);
        })

        resolve(outputFolder.replace('output/', 'final.xlsx'))
    })
}



function readWorkbook(outputFolder: string): { [key: string]: string } {
    const workbookSheetRelations = {}
    const worksheetXML = fs.readFileSync(`${outputFolder}xl/workbook.xml`, { encoding: 'utf-8' })
    xml2js.parseString(worksheetXML, async (err, res) => {
        // console.log('------------readWorkbook------------', res.workbook.sheets[0].sheet)
        res.workbook.sheets[0].sheet.forEach((el) => {
            // console.log(`workbookSheetRelations[el['$']['name']]`, el['$']['name'])
            workbookSheetRelations[el['$']['name']] = el['$']['r:id']
        })
    })
    return workbookSheetRelations
}

function readWorkbookRels(outputFolder: string): { [key: string]: string } {
    const workbookSheetRelations = {}
    const worksheetXML = fs.readFileSync(`${outputFolder}xl/_rels/workbook.xml.rels`, { encoding: 'utf-8' })
    xml2js.parseString(worksheetXML, async (err, res) => {
        res.Relationships.Relationship.forEach((el) => {
            workbookSheetRelations[el['$']['Id']] = el['$']['Target'].replace('worksheets/', '')
        })
    })
    return workbookSheetRelations
}

const mapSheetAliases = function (chartSheetsMap: chartSheetObj, outputFolder: string): { [key: string]: string } {
    //read workbook and workbook rels to match worksheet alias, the name an excel user can see, to the actual excel xml file name.
    const worksheetAliasMap = {}
    const workbookSheetMap: { [key: string]: string } = readWorkbook(outputFolder)
    const readWorkbookRelsMap: { [key: string]: string } = readWorkbookRels(outputFolder)
    Object.entries(workbookSheetMap).forEach(([k, v]) => worksheetAliasMap[k] = readWorkbookRelsMap[v])

    const aliasMap: { [key: string]: string } = {}
    Object.values(chartSheetsMap).forEach((el) => {
        el.outputSheets.forEach((el) => {
            aliasMap[el] = worksheetAliasMap[el]
        })
    })
    return aliasMap
}


// function readWorkbookRelsx(outputFolder: string): { [key: string]: string } {
//     const workbookSheetRelations = {}
//     const worksheetXML = fs.readFileSync(`${outputFolder}xl/_rels/workbook.xml.rels`, { encoding: 'utf-8' })

//     xml2js.parseString(worksheetXML, async (err, res) => {
//         res.Relationships.Relationship.forEach((el) => {
//             workbookSheetRelations[el['$']['Id']] = el['$']['Target'].replace('worksheets/', '')
//         })
//     })
//     return workbookSheetRelations
// }

const copyWorksheetRelationFileMulti = (worksheetName, chartSheetsMap, outputFolder, aliasMap, drawingIterator) => {
    //for each new worksheet, create the source relationship file with an updated file name
    //target needs to be set to the eventual name of the new drawing file that will be created in the next step.
    console.log('----copyWorksheetRelationFileMulti----')
    const drawingLookup = {}
    const worksheetRelsXML = fs.readFileSync(chartSheetsMap[worksheetName].worksheet_relsSource, { encoding: 'utf-8' })
    console.log('DONE READING ', chartSheetsMap[worksheetName].worksheet_relsSource)
    for (const outpufile of chartSheetsMap[worksheetName].outputSheets) {
        const newName = aliasMap[outpufile]
        drawingLookup[outpufile] = []

        xml2js.parseString(worksheetRelsXML, (err, res) => {
            res.Relationships.Relationship.forEach((el) => {
                if (el['$']['Target'].includes('../drawings/')) {
                    el['$']['Target'] = `../drawings/drawing${drawingIterator.value}`
                    drawingLookup[outpufile].push(`drawing${drawingIterator.value}`)
                    drawingIterator.value = drawingIterator.value + 1
                }
            })
            const builder = new xml2js.Builder()
            const xml = builder.buildObject(res)
            fs.writeFileSync(`${outputFolder}/xl/worksheets/_rels/${newName}.rels`, xml)
        })
    }
    return drawingLookup
}

const addWorkSheetDrawingsMulti = (worksheetName: string, chartSheetsMap: chartSheetObj, outputFolder: string, aliasMap: any): Promise<any>[] => {
    const returnList: Promise<any>[] = []
    const tag = chartSheetsMap[worksheetName].worksheetTag
    for (const newWorksheet of chartSheetsMap[worksheetName].outputSheets) {
        const alias = aliasMap[newWorksheet]
        const worksheetXML = fs.readFileSync(`${outputFolder}/xl/worksheets/${alias}`, { encoding: 'utf-8' })
        returnList.push(new Promise((resolve, reject) => {
            xml2js.parseString(worksheetXML, (err, res) => {
                if (err) {
                    console.log(err)
                    resolve(true)
                } else {
                    res.worksheet.drawing = tag
                    const builder = new xml2js.Builder()
                    const xml = builder.buildObject(res)
                    fs.writeFile(`${outputFolder}/xl/worksheets/${alias}`, xml, (err) => { if (err) console.log(err) })
                    resolve(true)
                }
            })
        }))
    }
    return returnList
}

const copyDrawingRelationFilesMulti = (
    worksheetName: string, chartSheetsMap: chartSheetObj, outputFolder: string, dumpFolderSource: string,
    drawingLookup: { [key: string]: string }, chartIterator: { [key: string]: number }, chartNameLookup: { [key: string]: { [key: string]: string[] } }
) => {
    const returnList: Promise<any>[] = []
    for (const newWorksheet of chartSheetsMap[worksheetName].outputSheets) {

        chartNameLookup[newWorksheet] = {}

        returnList.push(new Promise((resolve, reject) => {
            const drawingLookupName = drawingLookup[newWorksheet]
            const copyFileName = chartSheetsMap[worksheetName].drawingSource.replace(`${dumpFolderSource}xl/drawings/`, '')
            const relsPath = chartSheetsMap[worksheetName].drawingSource.replace(copyFileName, '')
            const from = `${relsPath}_rels/${copyFileName}.rels`
            const too = `${outputFolder}/xl/drawings/_rels/${drawingLookupName}xml.rels`

            const drawingRelsXML = fs.readFileSync(from, { encoding: 'utf-8' })

            xml2js.parseString(drawingRelsXML, (err, res) => {
                chartNameLookup[newWorksheet] = { [copyFileName]: [] }
                res.Relationships.Relationship.forEach((el) => {
                    if (el['$']['Target'].includes('../charts/')) {
                        const oldTarget = el['$']['Target'].replace('../charts/', '')
                        chartNameLookup[newWorksheet] = { [oldTarget]: [] }
                        el['$']['Target'] = `../charts/chart${chartIterator.value}`
                        chartNameLookup[newWorksheet][oldTarget].push(`chart${chartIterator.value}`)
                        chartIterator.value = chartIterator.value + 1
                    }
                })
                const builder = new xml2js.Builder()
                const xml = builder.buildObject(res)
                fs.writeFileSync(too, xml)
                resolve(true)
            })
        }))
    }
    return returnList
}

const copyDrawingFilesMulti = (
    worksheetName: string, chartSheetsMap: chartSheetObj, outputFolder: string, dumpFolderSource: string, drawingLookup: { [key: string]: string }
) => {
    const returnList: Promise<any>[] = []
    for (const newWorksheet of chartSheetsMap[worksheetName].outputSheets) {
        returnList.push(new Promise((resolve, reject) => {
            const drawingLookupName = drawingLookup[newWorksheet]
            const copyFileName = chartSheetsMap[worksheetName].drawingSource.replace(`${dumpFolderSource}xl/drawings/`, '')
            const relsPath = chartSheetsMap[worksheetName].drawingSource.replace(copyFileName, '')
            fs.copyFile(`${relsPath}/${copyFileName}`, `${outputFolder}/xl/drawings/${drawingLookupName}.xml`, (err) => {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    console.log(`copied drawings ${drawingLookupName}.xml`)
                }
                resolve(true)
            })
        }))
    }
    return returnList
}

export const copyAllChartsMulti = async function (targetFile: string, dumpFolderSource: string, outputFolder: string, chartSheetsMap: chartSheetObj): Promise<string> {
    //workbook.sheet.rID -> workbook.rels.name = worksheet.name
    return new Promise(async (resolve, reject) => {

        const unZip = new AdmZip(targetFile)
        unZip.extractAllTo(outputFolder, true) //unzip excel template file to dump folder.

        let overrides = {}
        let drawingIterator = { value: 1 }
        let chartIterator = { value: 1 }
        let colorStyleIterator = { value: 1 }
        // findOverrides(overrides, dumpFolderSource, outputFolder)

        if (!fs.existsSync(`${outputFolder}/xl/worksheets/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/worksheets/_rels/`, { recursive: true })
        if (!fs.existsSync(`${outputFolder}/xl/drawings/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/drawings/_rels/`, { recursive: true })
        if (!fs.existsSync(`${outputFolder}/xl/charts/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/charts/_rels/`, { recursive: true })

        const aliasMap: { [key: string]: string } = await mapSheetAliases(chartSheetsMap, outputFolder)
        console.log('ALIASMAP', aliasMap)

        Object.keys(chartSheetsMap).map(async (k) => { //promise all these file operations. Make sure each promise throws an error if failed.
            //sheet functions
            const drawingLookup: { [key: string]: string } = copyWorksheetRelationFileMulti(k, chartSheetsMap, outputFolder, aliasMap, drawingIterator)//copy relation file
            console.log('Drawing Lookup: ', drawingLookup)
            await Promise.all(addWorkSheetDrawingsMulti(k, chartSheetsMap, outputFolder, aliasMap))//add drawing tag.
            // //drawing functions
            const chartNameLookup: { [key: string]: { [key: string]: string[] } } = {}
            await Promise.all(copyDrawingRelationFilesMulti(k, chartSheetsMap, outputFolder, dumpFolderSource, drawingLookup, chartIterator, chartNameLookup))
            await Promise.all(copyDrawingFilesMulti(k, chartSheetsMap, outputFolder, dumpFolderSource, drawingLookup))
            console.log(chartNameLookup)
            // //chart functions && rename formula sheet refs.

            copyChartFiles(k, chartSheetsMap, outputFolder, dumpFolderSource)

            // //DONT FORGET TO REGISTER content types if new sheets created
            // //rezip file, retun string ref.
            // const zip = new AdmZip();
            // const outputFilename = outputFolder.replace('output/', 'final.xlsx')
            // console.log('outputFilename', outputFilename)
            // zip.addLocalFolder(outputFolder, '')
            // zip.writeZip(outputFilename);
        })

        resolve(outputFolder.replace('output/', 'final.xlsx'))
    })
}
