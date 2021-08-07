import { getDataSlice } from './getDataSlice.js'
import { processedPromiseData } from './processPromiseData'

export const checkTimeSeriesStatus = function (ws, promiseData: processedPromiseData) { //Checks promise data to determine if its time series or data point.
    //ws = excel template
    let returnFlag = 0
    ws.eachRow({ includeEmpty: false }, (row) => { //for each row
        row.eachCell({ includeEmpty: false }, (cell) => { //for each cell
            if (returnFlag === 0 && typeof cell.value === 'string' && cell.value.slice(0, 2) === '&=') { //if template formula detected
                const searchStringRaw = cell.value
                const searchString = searchStringRaw.slice(2, searchStringRaw.length) //remove &=
                if (searchString !== 'keys.keys') { //if data column
                    const dataObj = getDataSlice(promiseData, searchString) //could {key: string} pairs OR {key: OBJECT} pairs
                    if (typeof dataObj[Object.keys(dataObj)[0]] === 'object') {
                        returnFlag = 1 //flag 1  = time series
                    }
                }
            }
        })
    })

    return returnFlag
}