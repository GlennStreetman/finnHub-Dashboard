
import { findByString } from './findByString.js'
import { processedPromiseData } from './processPromiseData'

interface matchingData {
    [key: string]: any //data that matches querlist match.
}

export const getDataSlice = function (dataObj: processedPromiseData, queryString: string): matchingData {
    //iterates through all dataObj keys to finds all matching slices 
    //return object {security(s): value(s)}    
    const returnObj = {}

    const keys = dataObj.keys
    for (const s of keys) {
        const queryList: string[] = queryString.split('.')
        if (typeof dataObj?.[queryList[0]]?.[s]?.[queryList[1]] !== 'undefined') { //dataPoint
            const queryStringWithStock = [queryList[0], s, ...queryList.slice(1, queryList.length)] //creates tuple [searchKey, security, datapoint]
            let findData = findByString(dataObj, queryStringWithStock)
            returnObj[s] = findData
        } else { //Time series
            const timeSeriesSlice = dataObj?.[queryList[0]]?.[s]
            const val = {}
            for (const t in timeSeriesSlice) {
                val[t] = timeSeriesSlice?.[t]?.[queryList[1]]
            }
            returnObj[s] = val
        }
    }
    return returnObj
}