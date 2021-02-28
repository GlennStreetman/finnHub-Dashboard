import { createAsyncThunk } from '@reduxjs/toolkit';
import  {finnHub} from "./../appFunctions/throttleQueueAPI.js";

export const tUpdateDashboardData = createAsyncThunk( //{endPoint, [securityList]}
    'rEnqueue',
    (req, thunkAPI) => { //l{ist of securities} 
        console.log("THUNKING", req)
        // const finnData = thunkAPI.getState().finnHubData //finnHubData
        const finnQueue = thunkAPI.getState().finnHubQueue.throttle //finnHubData
        // console.log("GETSTATE", finnQueue)
        //for each request check if data is avaiable.
        let requestList = []
        for (const security of req.securityList) {
            // console.log('security: ', security, )
            if (
                (security.updated === undefined) ||
                (Date.now() - security.updated >= 1*1000*60*60*3)
            ) {//DATA NOT STALE (3 hour placeholder for now)
                // console.log("NOT STALE")
                const requestID = {
                    key: security.key,
                    stock: security.symbol,
                    }
                requestList.push(finnHub(finnQueue, security.apiString, requestID))
            }   
        }
        console.log('requestList: ', requestList)
        return Promise.all(requestList)
        .then((res) => {
            const e = req.endPoint
            const resObj = {dataSet: {[e]: {}}}
            for (const r of req.securityList) {
                const key = r.key
                resObj.dataSet[e][key] =  {...r}
            }
            for (const r in res) {
                const key = res[r].key
                const data = res[r].data
                resObj.dataSet[e][key].data = data
                resObj.dataSet[e][key].updated = Date.now()
            }

            return (resObj)
        })
    }
)