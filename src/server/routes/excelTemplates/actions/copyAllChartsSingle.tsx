
import AdmZip from 'adm-zip';
import xml2js from 'xml2js';
import fs from 'fs';
import util from 'util'
import { chartSheetObj, drawingRelsListObj } from '../runTemplate'
import { AnyARecord } from 'node:dns';

const copyWorksheetRelationFile = (worksheetName, chartSheetsMap, outputFolder) => {
    fs.copyFileSync(chartSheetsMap[worksheetName].worksheet_relsSource, `${outputFolder}/xl/worksheets/_rels/${worksheetName}.rels`)
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
                console.log(`2copied drawings rel ${worksheetName}.rels`)
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
                console.log(`1copied drawings ${worksheetName}.rels`)
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
            // console.log('---NAMES---', copyChartName, copyColorsName, copyStyleName, `${dumpFolderSource}xl/charts/`)
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

const findOverrides = (dumpFolderSource) => {
    const returnList: AnyARecord[] = []
    const readOverrides = fs.readFileSync(`${dumpFolderSource}/[Content_Types].xml`, { encoding: 'utf-8' })
    xml2js.parseString(readOverrides, async (err, res) => {
        // console.log('----OVERRIDES----', res.Types.Override)
        res.Types.Override.forEach((el) => {
            if (el['$'].PartName.includes('/xl/drawings/')) returnList.push(el)
            if (el['$'].PartName.includes('/xl/charts/')) returnList.push(el)
        })
    })
    console.log('RETURN LIST', returnList)
    return returnList
}

const copyChartOverrides = (overrides, outputFolder: string) => {
    const readOverrides = fs.readFileSync(`${outputFolder}/[Content_Types].xml`, { encoding: 'utf-8' })
    xml2js.parseString(readOverrides, async (err, res) => {
        // console.log('----OVERRIDES----', res.Types.Override, '--------------', overrides)
        res.Types.Override = res.Types.Override.concat(overrides)
        console.log('OUTPUT', res.Types.Override)
        const builder = new xml2js.Builder()
        const xml = builder.buildObject(res)
        fs.writeFileSync(`${outputFolder}/[Content_Types].xml`, xml)
    })
}

export const copyAllChartsSingle = async function (targetFile: string, dumpFolderSource, outputFolder, chartSheetsMap: chartSheetObj): Promise<string> {

    return new Promise(async (resolve, reject) => {

        const unZip = new AdmZip(targetFile)
        unZip.extractAllTo(outputFolder, true) //unzip excel template file to dump folder.

        if (!fs.existsSync(`${outputFolder}/xl/worksheets/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/worksheets/_rels/`, { recursive: true })
        if (!fs.existsSync(`${outputFolder}/xl/drawings/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/drawings/_rels/`, { recursive: true })
        if (!fs.existsSync(`${outputFolder}/xl/charts/_rels/`)) fs.mkdirSync(`${outputFolder}/xl/charts/_rels/`, { recursive: true })


        const actionChainList = Object.keys(chartSheetsMap).map(async (k) => { //promise all these file operations. Make sure each promise throws an error if failed.
            return new Promise(async (res) => {
                copyWorksheetRelationFile(k, chartSheetsMap, outputFolder)//copy relation file
                await addWorksheetDrawingsTag(k, chartSheetsMap, outputFolder)//add drawing tag.
                //drawing functions
                await copyDrawingRelationFiles(k, chartSheetsMap, outputFolder, dumpFolderSource)
                await copyDrawingFiles(k, chartSheetsMap, outputFolder, dumpFolderSource)
                //chart functions && rename formula sheet refs.
                await copyChartFiles(k, chartSheetsMap, outputFolder, dumpFolderSource)

                res(true)
            })
        })
        Promise.all(actionChainList).then(() => {
            //rezip file, retun string ref.
            //copy over overrides to new file.
            const overrideList = findOverrides(dumpFolderSource)
            copyChartOverrides(overrideList, outputFolder)

            const zip = new AdmZip();
            const outputFilename = outputFolder.replace('output/', 'final.xlsx')
            console.log('outputFilename1', outputFilename)
            zip.addLocalFolder(outputFolder, '')
            zip.writeZip(outputFilename);
            resolve(outputFolder.replace('output/', 'final.xlsx'))
        })

    })
}