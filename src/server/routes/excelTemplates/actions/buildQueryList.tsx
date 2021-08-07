import xlsx from 'xlsx';
import Papa from 'papaparse';
import { getGraphQLData, GQLReqObj } from './getGraphQLData.js'

const buildQueryList = (path): Promise<GQLReqObj>[] => {
    //From requested template, builds list of mongoDB promises requests from Query sheet.
    const returnList: Promise<GQLReqObj>[] = []
    let workbook = xlsx.readFile(path);
    const querySheet = workbook.Sheets['Query']
    const queryList: any = Papa.parse(xlsx.utils.sheet_to_csv(querySheet)).data
    for (const q in queryList) { //for each query in special query sheet.
        if (queryList?.[q]?.[0] && queryList[q][0] !== '') {
            const newPromiseObj: GQLReqObj = {
                n: queryList[q][0], //data name
                q: queryList[q][1], //query string
            }
            returnList.push(getGraphQLData(newPromiseObj))
        }
    }
    return returnList
}

export { buildQueryList }