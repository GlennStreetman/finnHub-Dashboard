import { produce } from 'immer'
import AdmZip from 'adm-zip';
import xml2js from 'xml2js';
import fs from 'fs';
import util from 'util'
import { chartSheetObj } from '../runTemplate'

const copyFilePromise = util.promisify(fs.copyFile);

function readWorkbook(outputFolder: string): { [key: string]: string } {
    const workbookSheetRelations = {}
    const worksheetXML = fs.readFileSync(`${outputFolder}xl/workbook.xml`, { encoding: 'utf-8' })
    xml2js.parseString(worksheetXML, async (err, res) => {
        res.workbook.sheets[0].sheet.forEach((el) => {
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

const copyWorksheetRelationFileMulti = (worksheetName, chartSheetsMap, outputFolder, aliasMap, drawingIterator) => {
    //for each new worksheet, create the source relationship file with an updated file name
    //target needs to be set to the eventual name of the new drawing file that will be created in the next step.
    console.log('----copyWorksheetRelationFileMulti----')
    const drawingLookup = {}
    const worksheetRelsXML = fs.readFileSync(chartSheetsMap[worksheetName].worksheet_relsSource, { encoding: 'utf-8' })
    console.log('DONE READING ', chartSheetsMap[worksheetName].worksheet_relsSource)
    for (const outpufile of chartSheetsMap[worksheetName].outputSheets) {
        const newName = aliasMap[outpufile]
        // drawingLookup[outpufile] = []

        xml2js.parseString(worksheetRelsXML, (err, res) => {
            res.Relationships.Relationship.forEach((el) => {
                if (el['$']['Target'].includes('../drawings/')) {
                    el['$']['Target'] = `../drawings/drawing${drawingIterator.value}.xml`
                    // drawingLookup[outpufile].push(`drawing${drawingIterator.value}`)
                    drawingLookup[outpufile] = `drawing${drawingIterator.value}`
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
            const too = `${outputFolder}/xl/drawings/_rels/${drawingLookupName}.xml.rels`

            const drawingRelsXML = fs.readFileSync(from, { encoding: 'utf-8' })

            xml2js.parseString(drawingRelsXML, (err, res) => {
                chartNameLookup[newWorksheet] = { [copyFileName]: [] }
                res.Relationships.Relationship.forEach((el) => {
                    if (el['$']['Target'].includes('../charts/')) {
                        const oldTarget = el['$']['Target'].replace('../charts/', '').replace('.xml', '')
                        chartNameLookup[newWorksheet] = { [oldTarget]: [] }
                        el['$']['Target'] = `../charts/chart${chartIterator.value}.xml`
                        chartNameLookup[newWorksheet][oldTarget].push(`${chartIterator.value}`)
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
    worksheetName: string, chartSheetsMap: chartSheetObj, outputFolder: string, dumpFolderSource: string, drawingLookup: { [key: string]: string }, overrides
) => {
    const returnList: Promise<any>[] = []
    for (const newWorksheet of chartSheetsMap[worksheetName].outputSheets) {
        returnList.push(new Promise((resolve, reject) => {
            // console.log('drawingLookup', drawingLookup)
            const drawingLookupName = drawingLookup[newWorksheet]
            const copyFileName = chartSheetsMap[worksheetName].drawingSource.replace(`${dumpFolderSource}xl/drawings/`, '')
            const relsPath = chartSheetsMap[worksheetName].drawingSource.replace(copyFileName, '')
            overrides.addOverride(copyFileName.replace('.xml', ''), drawingLookupName)
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

const copyChartFilesMulti =
    (
        worksheetName: string,
        chartSheetsMap: chartSheetObj,
        outputFolder: string,
        dumpFolderSource: string,
        chartNameLookup: { [key: string]: { [key: string]: string[] } },
        overrides,
        sourceWorksheets: string[]
    ) => {

        return new Promise((resolve, reject) => { //for each output worksheet that contains a chart.
            const copyList: Promise<any>[] = []
            Object.values(chartSheetsMap[worksheetName].outputSheets).forEach((outputAlias) => { //each sheet
                Object.entries(chartNameLookup[outputAlias]).forEach(([k, v]) => { //each alias
                    const suffix = outputAlias.replace(`${chartSheetsMap[worksheetName].alias}-`, '')
                    console.log('copyChartFilesMulti', chartSheetsMap, sourceWorksheets, outputAlias, suffix)
                    const chartSources = chartSheetsMap[worksheetName].drawing_relsSource[k]
                    const worksheetXML = fs.readFileSync(chartSources.chart_RelsSource, { encoding: 'utf-8' }) //read _rels source file.
                    copyList.push(new Promise((resolve, reject) => {
                        xml2js.parseString(worksheetXML, (err, res) => { // copy styles, colors, _rels
                            if (err) {
                                console.log(err)
                                resolve(true)
                            } else {
                                const workthroughlist: any[] = Object.values(res.Relationships.Relationship)
                                Object.values(workthroughlist).forEach((el) => {
                                    if (el['$'].Target.includes('style')) { el['$'].Target = `style${v}.xml` }
                                    if (el['$'].Target.includes('colors')) { el['$'].Target = `colors${v}.xml` }
                                })

                                const builder = new xml2js.Builder()
                                const xml = builder.buildObject(res)
                                fs.writeFileSync(`${outputFolder}/xl/charts/_rels/chart${v}.xml.rels`, xml)
                                resolve(true)
                            }
                        })
                    }))

                    //update list of xml <Overrides> for new files being created. To be used in [Content_Types].xml
                    const chartSourceFilename = chartSources.chartSource.replace(`${dumpFolderSource}xl/charts/`, '').replace('.xml', '')
                    overrides.addOverride(chartSourceFilename, `chart${v}`)
                    const colorSourceFilename = chartSources.colorSource.replace(`${dumpFolderSource}xl/charts/`, '').replace('.xml', '')
                    overrides.addOverride(colorSourceFilename, `colors${v}`)
                    const styleSourceFilename = chartSources.styleSource.replace(`${dumpFolderSource}xl/charts/`, '').replace('.xml', '')
                    overrides.addOverride(styleSourceFilename, `style${v}`)

                    let copyChartXML = fs.readFileSync(chartSources.chartSource, { encoding: 'utf-8' }) //read chart source file.
                    copyList.push(new Promise((resolve, reject) => { //update chart formula references.

                        //replace any reference to source worksheet aliases

                        sourceWorksheets.forEach((alias => { //for each source worksheet, replace worksheet alias reference, in excel formulas, with updated worksheet alias.
                            console.log('REPLACE', alias, 'WITH', `'${alias}-${suffix}'!`)
                            // const chartALias = chartSheetsMap[worksheetName].alias
                            const formatALias = "'" + alias + "'!"
                            const regCheck = new RegExp(`${formatALias}`, 'g')
                            // copyChartXML = copyChartXML.replace(regCheck, `'${outputAlias}'!`)
                            copyChartXML = copyChartXML.replace(regCheck, `'${alias}-${suffix}'!`)
                            const formatALias2 = alias + "!"
                            const regCheck2 = new RegExp(`${formatALias2}`, 'g')
                            //copyChartXML = copyChartXML.replace(regCheck2, `'${outputAlias}'!`)
                            copyChartXML = copyChartXML.replace(regCheck2, `'${alias}-${suffix}'!`)
                        }))


                        fs.writeFileSync(`${outputFolder}/xl/charts/chart${v}.xml`, copyChartXML)
                        resolve(true)
                    }))

                    // copyList.push(copyFilePromise(chartSources.chartSource, `${outputFolder}/xl/charts/chart${v}.xml`)) //copy chart
                    copyList.push(copyFilePromise(chartSources.colorSource, `${outputFolder}/xl/charts/colors${v}.xml`)) //copy color
                    copyList.push(copyFilePromise(chartSources.styleSource, `${outputFolder}/xl/charts/style${v}.xml`)) //copy styles
                })
            })
            Promise.all(copyList).then(() => {
                resolve(true)
            })

        })
    }

const findOverrides = (dumpFolderSource) => {
    const returnObj = {}
    const readOverrides = fs.readFileSync(`${dumpFolderSource}/[Content_Types].xml`, { encoding: 'utf-8' })
    xml2js.parseString(readOverrides, async (err, res) => {
        res.Types.Override.forEach((el) => {
            if (el['$'].PartName.includes('/xl/drawings/')) returnObj[el['$'].PartName.replace('/xl/drawings/', '').replace('.xml', '')] = el
            if (el['$'].PartName.includes('/xl/charts/')) returnObj[el['$'].PartName.replace('/xl/charts/', '').replace('.xml', '')] = el
        })
    })
    return returnObj
}

const writeNewOverrides = (overrides, outputFolder: string) => {
    const readOverrides = fs.readFileSync(`${outputFolder}/[Content_Types].xml`, { encoding: 'utf-8' })
    xml2js.parseString(readOverrides, async (err, res) => {
        res.Types.Override = res.Types.Override.concat(overrides.newOverrides)
        const builder = new xml2js.Builder()
        const xml = builder.buildObject(res)
        fs.writeFileSync(`${outputFolder}/[Content_Types].xml`, xml)
    })
}

export const copyAllChartsMulti = async function (
    targetFile: string,
    dumpFolderSource: string,
    outputFolder: string,
    chartSheetsMap: chartSheetObj,
    sourceWorksheets: string[]): Promise<string> {
    //workbook.sheet.rID -> workbook.rels.name = worksheet.name
    return new Promise(async (resolve, reject) => {

        const unZip = new AdmZip(targetFile)
        unZip.extractAllTo(outputFolder, true) //unzip excel template file to dump folder.

        //create folder structure needed for copy operations below.
        if (!fs.existsSync(`${outputFolder}/xl/worksheets/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/worksheets/_rels/`, { recursive: true })
        if (!fs.existsSync(`${outputFolder}/xl/drawings/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/drawings/_rels/`, { recursive: true })
        if (!fs.existsSync(`${outputFolder}/xl/charts/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/charts/_rels/`, { recursive: true })

        let drawingIterator = { value: 1 } //drawing?.xml unique name incrementor
        let chartIterator = { value: 1 }  //chart?, style?, color? .xml unique name incrementor
        const overrides = { //list of source and new xml <Override> tags that need to be inserted into [content_Types].xml
            sourceOverrides: findOverrides(dumpFolderSource),
            newOverrides: [],
            addOverride: function (oldName, newName) {
                const copySource = produce(this.sourceOverrides[oldName], (draftState) => {
                    draftState['$'].PartName = draftState['$'].PartName.replace(oldName.trim(), newName.trim())
                    return draftState
                })
                this.newOverrides.push(copySource)
            },
        }
        const aliasMap: { [key: string]: string } = await mapSheetAliases(chartSheetsMap, outputFolder) //matches excel sheet names, that are visable to user, to xml sheet ids.

        const actionChainList = Object.keys(chartSheetsMap).map(async (k) => { //promise all these file operations. Make sure each promise throws an error if failed.
            return new Promise(async (res) => {

                const drawingLookup: { [key: string]: string } = copyWorksheetRelationFileMulti(k, chartSheetsMap, outputFolder, aliasMap, drawingIterator)//copy relation  xmlfile
                const chartNameLookup: { [key: string]: { [key: string]: string[] } } = {} //lookup object from --> to mapping of copied charts.

                await Promise.all(addWorkSheetDrawingsMulti(k, chartSheetsMap, outputFolder, aliasMap))//add drawing tag to worksheets that will have charts.
                await Promise.all(copyDrawingRelationFilesMulti(k, chartSheetsMap, outputFolder, dumpFolderSource, drawingLookup, chartIterator, chartNameLookup)) //copy drawing_rel xmls.
                await Promise.all(copyDrawingFilesMulti(k, chartSheetsMap, outputFolder, dumpFolderSource, drawingLookup, overrides)) //copy drawing xmls
                await copyChartFilesMulti(k, chartSheetsMap, outputFolder, dumpFolderSource, chartNameLookup, overrides, sourceWorksheets) //copy chart, style, colors, _rel xmls for charts

                res(true)
            })
        })

        Promise.all(actionChainList).then(() => {
            writeNewOverrides(overrides, outputFolder)
            const zip = new AdmZip();
            const outputFilename = outputFolder.replace('output/', 'final.xlsx')
            console.log('outputFilename1', outputFilename)
            zip.addLocalFolder(outputFolder, '')
            zip.writeZip(outputFilename);
            resolve(outputFolder.replace('output/', 'final.xlsx'))
        })
    })
}

