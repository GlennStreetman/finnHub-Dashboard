import { produce } from 'immer'
import AdmZip from 'adm-zip';
import xml2js from 'xml2js';
import fs from 'fs';
import util from 'util'
import { chartSheetObj } from '../runTemplate'
import { templateData } from './buildTemplateData.js'

const copyFilePromise = util.promisify(fs.copyFile);

interface xmlLookupOb {
    [key: string]: string
}


function readWorkbook(outputFolder: string): [xmlLookupOb, xmlLookupOb] {
    const workbookSheetRelations: xmlLookupOb = {}
    const workbookDefinedNames: xmlLookupOb = {}
    const worksheetXML = fs.readFileSync(`${outputFolder}xl/workbook.xml`, { encoding: 'utf-8' })
    xml2js.parseString(worksheetXML, async (err, res) => {
        res.workbook.sheets[0].sheet.forEach((el) => {
            workbookSheetRelations[el['$']['name']] = el['$']['r:id']
        })
        res.workbook.definedNames[0].definedName.forEach((el) => {
            workbookDefinedNames[el['$']['name']] = el
        })
    })

    return [workbookSheetRelations, workbookDefinedNames]
}

function readWorkbookRels(outputFolder: string): xmlLookupOb {
    const workbookSheetRelations = {}
    const worksheetXML = fs.readFileSync(`${outputFolder}xl/_rels/workbook.xml.rels`, { encoding: 'utf-8' })
    xml2js.parseString(worksheetXML, async (err, res) => {
        res.Relationships.Relationship.forEach((el) => {
            workbookSheetRelations[el['$']['Id']] = el['$']['Target'].replace('worksheets/', '')
        })
    })
    return workbookSheetRelations
}

const mapSheetAliases = function (chartSheetsMap: chartSheetObj, outputFolder: string): [xmlLookupOb, xmlLookupOb] {
    //read workbook and workbook rels to match worksheet alias, the name an excel user can see, to the actual excel xml file name.
    const worksheetAliasMap = {}
    const [workbookSheetMap, definedNames] = readWorkbook(outputFolder)
    const readWorkbookRelsMap: { [key: string]: string } = readWorkbookRels(outputFolder)
    Object.entries(workbookSheetMap).forEach(([k, v]) => worksheetAliasMap[k] = readWorkbookRelsMap[v])

    const aliasMap: { [key: string]: string } = {}
    Object.values(chartSheetsMap).forEach((el) => {
        el.outputSheets.forEach((el) => {
            aliasMap[el] = worksheetAliasMap[el]
        })
    })

    return [aliasMap, definedNames]
}

const copyWorksheetRelationFileMulti = (worksheetName, chartSheetsMap, outputFolder, aliasMap, drawingIterator) => {
    //for each new worksheet, create the source relationship file with an updated file name
    //target needs to be set to the eventual name of the new drawing file that will be created in the next step.
    const drawingLookup = {}
    const worksheetRelsXML = fs.readFileSync(chartSheetsMap[worksheetName].worksheet_relsSource, { encoding: 'utf-8' })
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
    worksheetName: string,
    chartSheetsMap: chartSheetObj,
    outputFolder: string,
    dumpFolderSource: string,
    drawingLookup: { [key: string]: string },
    chartIterator: { [key: string]: number },
    chartNameLookup: { [key: string]: { [key: string]: string[] } }
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

                res.Relationships.Relationship.forEach((el) => {
                    if (el['$']['Target'].includes('../charts/')) { //if relation is a reference to a chart.
                        const oldTarget = el['$']['Target'].replace('../charts/', '').replace('.xml', '') //suffix not including file type with number ref.
                        const oldTargetSuffix = oldTarget.replace(new RegExp(`[0-9]`, 'g'), '') //strip number ref from suffix.
                        if (!chartNameLookup[newWorksheet][oldTarget]) chartNameLookup[newWorksheet][oldTarget] = []
                        el['$']['Target'] = `../charts/${oldTargetSuffix}${chartIterator.value}.xml`
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
            const drawingLookupName = drawingLookup[newWorksheet]
            const copyFileName = chartSheetsMap[worksheetName].drawingSource.replace(`${dumpFolderSource}xl/drawings/`, '')
            const relsPath = chartSheetsMap[worksheetName].drawingSource.replace(copyFileName, '')
            overrides.addOverride(copyFileName.replace('.xml', ''), drawingLookupName)
            fs.copyFileSync(`${relsPath}/${copyFileName}`, `${outputFolder}/xl/drawings/${drawingLookupName}.xml`)
            resolve(true)
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
        sourceWorksheets: string[], //list of all worksheets in original template
        definedNames, //defineName tags in workbook.xml that corrospond to some char types that use cx:f tags. cx:f tags denote a names range.
        templateData: templateData, //
    ) => {

        return new Promise((resolve, reject) => { //for each output worksheet that contains a chart.
            const copyList: Promise<any>[] = []
            Object.values(chartSheetsMap[worksheetName].outputSheets).forEach((outputAlias) => { //each sheet
                Object.entries(chartNameLookup[outputAlias]).forEach(([sourceChartName, chartNumberLookup]) => { //for each source chart.
                    const chartNamePrefix = sourceChartName.replace(new RegExp(`[0-9]`, 'g'), '') //chart?.xml file name prefix. Normaly chart or chartEx
                    const suffix = outputAlias.replace(`${chartSheetsMap[worksheetName].alias}-`, '') //worksheet suffix ex: US-AAPL
                    chartNumberLookup.forEach((chartref) => { //for each destination chart.
                        const chartSources = chartSheetsMap[worksheetName].drawing_relsSource[sourceChartName]
                        const worksheetXML = fs.readFileSync(`${dumpFolderSource}xl/charts/_rels/${sourceChartName}.xml.rels`, { encoding: 'utf-8' }) //read _rels source file.
                        copyList.push(new Promise((resolve, reject) => {
                            xml2js.parseString(worksheetXML, (err, res) => { // copy styles, colors, _rels
                                if (err) {
                                    console.log(err)
                                    resolve(true)
                                } else {
                                    const workthroughlist: any[] = Object.values(res.Relationships.Relationship)
                                    Object.values(workthroughlist).forEach((el) => {
                                        if (el['$'].Target.includes('style')) { el['$'].Target = `style${chartref}.xml` }
                                        if (el['$'].Target.includes('colors')) { el['$'].Target = `colors${chartref}.xml` }
                                    })

                                    const builder = new xml2js.Builder()
                                    const xml = builder.buildObject(res)
                                    fs.writeFileSync(`${outputFolder}/xl/charts/_rels/${chartNamePrefix}${chartref}.xml.rels`, xml) //write chart rels
                                    resolve(true)
                                }
                            })
                        }))

                        //update list of xml <Overrides> for new files being created. To be used in [Content_Types].xml
                        const chartSourceFilename = chartSources.chartSource.replace(`${dumpFolderSource}xl/charts/`, '').replace('.xml', '')
                        overrides.addOverride(chartSourceFilename, `${chartNamePrefix}${chartref}`)
                        const colorSourceFilename = chartSources.colorSource.replace(`${dumpFolderSource}xl/charts/`, '').replace('.xml', '')
                        overrides.addOverride(colorSourceFilename, `colors${chartref}`)
                        const styleSourceFilename = chartSources.styleSource.replace(`${dumpFolderSource}xl/charts/`, '').replace('.xml', '')
                        overrides.addOverride(styleSourceFilename, `style${chartref}`)

                        let copyChartXML = fs.readFileSync(chartSources.chartSource, { encoding: 'utf-8' }) //read chart source file.
                        copyList.push(new Promise((resolve, reject) => { //update chart formula references.

                            sourceWorksheets.forEach((alias => {
                                const regexString = `${alias}!\\$[A-Z]{1,3}\\$[0-9]{1,7}:\\$[A-Z]{1,3}\\$[0-9]{1,7}` //any excel formula that matches alias string with single quotes around sheet alias.
                                const stringFinder = new RegExp(regexString, 'g')
                                const matchList = [...new Set(copyChartXML.match(stringFinder))]
                                if (matchList.length > 0) matchList.forEach((el) => {
                                    //for each unique matching string replace that matching string with a array reference that ends at last cell from time series data. 
                                    let startRow = el.slice(0, el.lastIndexOf(':'))
                                    startRow = startRow.slice(startRow.lastIndexOf('$') + 1, startRow.length)
                                    const endRow = parseInt(startRow) + parseInt(templateData[alias][startRow].writeRows) - 1
                                    const replaceString = el.slice(0, el.lastIndexOf('$')) + '$' + endRow
                                    copyChartXML = copyChartXML.replace(el, replaceString)
                                })
                            }))

                            sourceWorksheets.forEach((alias => {//for each source worksheet 
                                //replace worksheet alias reference, in excel formulas, with updated worksheet alias.
                                const formatALias = "'" + alias + "'!"
                                const regCheck = new RegExp(`${formatALias}`, 'g')
                                copyChartXML = copyChartXML.replace(regCheck, `'${alias}-${suffix}'!`)
                                const formatALias2 = alias + "!"
                                const regCheck2 = new RegExp(`${formatALias2}`, 'g')
                                copyChartXML = copyChartXML.replace(regCheck2, `'${alias}-${suffix}'!`)
                            }))

                            definedNames.addNewSourceNameTag(copyChartXML, suffix, `${outputFolder}/xl/charts/${chartNamePrefix}${chartref}.xml`, templateData) //updates xml defineName ref, if it exists.
                            console.log('SOURCE NAME TAG ADDED')
                            resolve(true)
                        }))

                        // copyList.push(copyFilePromise(chartSources.chartSource, `${outputFolder}/xl/charts/${chartNamePrefix}${chartref}.xml`)) //copy chart
                        copyList.push(copyFilePromise(chartSources.colorSource, `${outputFolder}/xl/charts/colors${chartref}.xml`)) //copy color
                        copyList.push(copyFilePromise(chartSources.styleSource, `${outputFolder}/xl/charts/style${chartref}.xml`)) //copy styles
                    })
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

const writeNewDefineNames = (defineNames, outputFolder: string, sourceFolder: string) => {
    return new Promise((resolve, reject) => {
        const sourceWOrkbook = fs.readFileSync(`${sourceFolder}/xl/workbook.xml`, { encoding: 'utf-8' })
        let extLst
        xml2js.parseString(sourceWOrkbook, async (err, res) => {
            extLst = res.workbook.extLst
        })

        const readWorkbook = fs.readFileSync(`${outputFolder}/xl/workbook.xml`, { encoding: 'utf-8' })
        xml2js.parseString(readWorkbook, async (err, res) => {
            res.workbook.definedNames[0].definedName = defineNames.newChartDefineNameXMLTags
            res.workbook.extLst = extLst
            const builder = new xml2js.Builder()
            const xml = builder.buildObject(res)
            fs.writeFile(`${outputFolder}xl/workbook.xml`, xml, (err) => { if (err) { console.log(err) } else { resolve(true) } })
        })
    })
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
    targetFile: string, //target output folder
    sourceFolder: string, //source file folder
    outputFolder: string, //output file folder.
    chartSheetsMap: chartSheetObj, //see chartSheetObj interface. Map of relationships between charts xml files and sheets.
    sourceWorksheets: string[], //list of source sheet aliases.
    templateData: templateData,
): Promise<string> {

    console.log('chartSheetMap', util.inspect(chartSheetsMap, false, null, true /* enable colors */))

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
            sourceOverrides: findOverrides(sourceFolder),
            newOverrides: [],
            addOverride: function (oldName, newName) {
                const copySource = produce(this.sourceOverrides[oldName], (draftState) => {
                    draftState['$'].PartName = draftState['$'].PartName.replace(oldName.trim(), newName.trim())
                    return draftState
                })
                this.newOverrides.push(copySource)
            },
        }

        const [aliasMap, definedNamesSource] = await mapSheetAliases(chartSheetsMap, outputFolder) //matches excel sheet names, that are visable to user, to xml sheet ids.
        const definedNames = { //list of source and new xml <Override> tags that need to be inserted into [content_Types].xml
            sourceNames: definedNamesSource, //list of source worksheet aliases.
            newChartDefineNameXMLTags: [], //list of xml tags that need to be added to the defined names section of worksheetXML.
            newSourceNameIterator: 1,
            addNewSourceNameTag: function (copyChartXML, suffix, outputURL, templateData) { //takes xml string representation of chart. Updates XML define name refs & updates NewSourceNameXMLTags
                Object.keys(this.sourceNames).forEach((name) => { //for each source chart name, replace sourcename with updated output name.
                    if (copyChartXML.includes(name)) {
                        const newSourceName = '_xlchart.v1.' + this.newSourceNameIterator
                        const newSourceNameTag = '>_xlchart.v1.' + this.newSourceNameIterator + '<'
                        const regReplaceName = new RegExp(`>${name}<`, 'g')
                        copyChartXML = copyChartXML.replace(regReplaceName, newSourceNameTag) //replace old defineName ref in chart.xml
                        const updateXMLTag = produce(this.sourceNames[name], (draftState) => {  //update $name and _
                            draftState['$'].name = newSourceName //update name ref
                            sourceWorksheets.forEach((ws) => { //update '_' sheet ref.
                                if (draftState['_'].includes(`${ws}!`)) {
                                    if (draftState['_'].indexOf(':') < 1) { //column reference
                                        draftState['_'] = draftState['_'].replace(ws, `'${ws}-${suffix}'`)
                                    } else { //array reference
                                        let el = draftState['_']
                                        const alias = el.slice(0, el.indexOf('!'))
                                        let startRow = el.slice(0, el.lastIndexOf(':'))
                                        startRow = startRow.slice(startRow.lastIndexOf('$') + 1, startRow.length)
                                        const endRow = parseInt(startRow) + parseInt(templateData[alias][startRow].writeRows) - 1
                                        const replaceString = el.slice(0, el.lastIndexOf('$')) + '$' + endRow
                                        el = el.replace(el, replaceString)
                                        draftState['_'] = el.replace(ws, `'${ws}-${suffix}'`) //update ws name to new alias.
                                    }
                                }
                            })
                        })
                        this.newChartDefineNameXMLTags.push(updateXMLTag)
                    }
                    // console.log('newChartDefineNameXMLTags', this.newChartDefineNameXMLTags)
                    fs.writeFileSync(outputURL, copyChartXML)
                    this.newSourceNameIterator = this.newSourceNameIterator + 1
                })
            },
        }

        const actionChainList = Object.keys(chartSheetsMap).map(async (k) => { //promise all these file operations. Make sure each promise throws an error if failed.
            return new Promise(async (res) => {
                const chartNameLookup: { [key: string]: { [key: string]: string[] } } = {} //lookup object from --> to mapping of copied charts.

                //copy relation  xmlfile
                const drawingLookup: { [key: string]: string } = copyWorksheetRelationFileMulti(k, chartSheetsMap, outputFolder, aliasMap, drawingIterator)
                //add drawing tag to worksheets that will have charts.
                await Promise.all(addWorkSheetDrawingsMulti(k, chartSheetsMap, outputFolder, aliasMap))
                //drawing sheet and rels.
                await Promise.all(copyDrawingRelationFilesMulti(k, chartSheetsMap, outputFolder, sourceFolder, drawingLookup, chartIterator, chartNameLookup)) //copy drawing_rel xmls.
                await Promise.all(copyDrawingFilesMulti(k, chartSheetsMap, outputFolder, sourceFolder, drawingLookup, overrides)) //copy drawing xmls
                //chart functions && rename formula sheet refs.
                await copyChartFilesMulti(k, chartSheetsMap, outputFolder, sourceFolder, chartNameLookup, overrides, sourceWorksheets, definedNames, templateData) //copy chart, style, colors, _rel xmls for charts
                console.log('Done with action chain list.')
                res(true)
            })
        })

        Promise.all(actionChainList).then(async () => {
            await writeNewDefineNames(definedNames, outputFolder, sourceFolder)
            writeNewOverrides(overrides, outputFolder)
            const zip = new AdmZip();
            const outputFilename = outputFolder.replace('output/', 'final.xlsx')
            zip.addLocalFolder(outputFolder, '')
            zip.writeZip(outputFilename);
            resolve(outputFolder.replace('output/', 'final.xlsx'))
        })
    })
}

