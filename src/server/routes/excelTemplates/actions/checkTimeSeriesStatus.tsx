import { getDataSlice } from './getDataSlice.js'
import { processedPromiseData } from './processPromiseData'

//this needs to be revised. Replace typeof test with something more explicit?
export const checkTimeSeriesStatus = function (ws, promiseData: processedPromiseData): boolean { //Checks promise data to determine if its time series or data point.
    let returnFlag = false
    ws.eachRow({ includeEmpty: false }, (row) => { //for each row
        row.eachCell({ includeEmpty: false }, (cell) => { //for each cell
            if (returnFlag === false && typeof cell.value === 'string' && cell.value.slice(0, 2) === '&=') { //if template formula detected
                const searchStringRaw = cell.value
                const searchString = searchStringRaw.slice(2, searchStringRaw.length) //remove &=
                if (searchString !== 'keys.keys') { //if data column
                    const dataObj = getDataSlice(promiseData, searchString) //could {key: string} pairs OR {key: OBJECT} pairs
                    if (typeof dataObj[Object.keys(dataObj)[0]] === 'object') {
                        returnFlag = true //flag 1  = time series
                    }
                }
            }
        })
    })
    return returnFlag
}