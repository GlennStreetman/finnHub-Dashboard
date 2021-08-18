import { chartSheetObj } from './../runTemplate'

function findAlias(worksheetName: string, chartSheets: chartSheetObj): string {
    const alias: string[] = Object.entries(chartSheets)
        .filter(([k, v]) => v.alias === worksheetName)
        .map(([k, v]) => k)
    return alias[0] ? alias[0] : ''
}

export const printTemplateWorksheets = function (w, worksheetName: string, worksheetKeys: Set<string>, sourceTemplate, chartSheets: chartSheetObj) { //none typed params are excelJS worksheets.
    //create template copys for each security key if query string multi=true
    for (const s of worksheetKeys) {
        let copySheet = w.addWorksheet(`temp`)
        copySheet.model = sourceTemplate.model
        copySheet.name = `${worksheetName}-${s}`
        const alias = findAlias(worksheetName, chartSheets)
        chartSheets?.[alias]?.outputSheets.push(`${worksheetName}-${s}`)
    }
}