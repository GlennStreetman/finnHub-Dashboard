import { GQLReqObj } from './getGraphQLData.js'

export interface processedPromiseData {
    keys: string[], //string SET
    [key: string]: any
}

export const processPromiseData = (req: GQLReqObj[]): processedPromiseData => {
    //build dataObj containing results of mongoDB ALL requests
    const dataObj: processedPromiseData = { keys: [] }
    const keyList: Set<string> = new Set()
    for (const w in req) { //for each widget
        dataObj[req[w].n] = {}
        const widgetD = req?.[w]?.data?.widget
        if (widgetD !== undefined) {
            for (const s of widgetD) { //for each security
                //add data and update key SET.
                keyList.add(s.security)
                dataObj[req[w].n][s.security] = s.data
            }
        }
    }
    dataObj.keys = [...keyList] //list from SET,avoids and possible duplicate in keys
    return dataObj
}
