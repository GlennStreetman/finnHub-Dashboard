

export const printTemplateWorksheets = function (w, worksheetName, worksheetKeys: Set<string>, sourceTemplate) { //none typed params are excelJS worksheets.
    //create template copys for each security key if query string multi=true
    for (const s of worksheetKeys) {
        let copySheet = w.addWorksheet(`temp`)
        copySheet.model = sourceTemplate.model
        copySheet.name = `${worksheetName}-${s}`
    }
}