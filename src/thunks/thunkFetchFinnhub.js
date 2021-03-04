import { createAsyncThunk } from '@reduxjs/toolkit';
import  {finnHub} from "./../appFunctions/throttleQueueAPI.js";

export const tUpdateDashboardData = createAsyncThunk( //{endPoint, [securityList]}
    'rEnqueue',
    (req, thunkAPI) => { //l{ist of securities} 
        const finnQueue = thunkAPI.getState().finnHubQueue.throttle //finnHubData
        console.log('finnQueue', finnQueue)
        let requestList = []  //for each request check if data is avaiable.
        const thisRequest = req.entries()
        // console.log('thisRequest', thisRequest)
        for (const n of thisRequest) { //for each widget
            // console.log("N", n)
            const endPoint = [n][0][1].apiString
            const reqKey = [n][0][0]
            // console.log('!!1', reqKey, endPoint)
            if (
                (endPoint.updated === undefined) ||
                (Date.now() - endPoint.updated >= 1*1000*60*60*3) //more than 3 hours old.
            ) {//DATA NOT STALE 
                // console.log("STALE DATA DETECTED.")
                // const requestID = {
                //     key: thisStock.key,
                //     endPoint: req.endPointName,
                //     widgetID: widgetName,
                //     thisStock: thisStock,
                //     }
                console.log("!4", endPoint, reqKey)
                requestList.push(finnHub(finnQueue, endPoint, reqKey))
            }   
        }
        console.log('requestList: ', requestList)
        return Promise.all(requestList)
        .then((res) => {
            // console.log("res",res)
            const resObj = {}
            for (const resStock of res) {
                // resObj.dataSet[resStock.endPoint] = {}
                resObj[resStock.key] = {}
                resObj[resStock.key].apiString = resStock.apiString
                resObj[resStock.key].data = resStock.data
                resObj[resStock.key].updated = Date.now()
                    
            }
            // console.log("res2", res)
            return (resObj)
        })
    })
        