import { createAsyncThunk } from '@reduxjs/toolkit';
import  {finnHub} from "./../appFunctions/throttleQueueAPI.js";

export const tUpdateDashboardData = createAsyncThunk( //{endPoint, [securityList]}
    'rEnqueue',
    (req, thunkAPI) => { //l{ist of securities} 
        const finnQueue = thunkAPI.getState().finnHubQueue.throttle //finnHubData
        // console.log('finnQueue', finnQueue)
        let requestList = []  //for each request check if data is avaiable.
        const thisRequest = req
        console.log('thisRequest', thisRequest)
        for (const n in thisRequest) { //for each widget
            console.log("N", n)
            const endPoint = thisRequest[n].apiString
            const reqKey = n
            console.log('!!1', reqKey, endPoint)
            if (
                (endPoint.updated === undefined) ||
                (Date.now() - endPoint.updated >= 1*1000*60*60*3) //more than 3 hours old.
            ) {
                requestList.push(finnHub(finnQueue, endPoint, reqKey))
            }   
        }
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
            //send to mongoDB HERE  
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resObj),
                };
            // console.log("Sending mongoDB updates", options)
            fetch("/mongoUpdate", options)
            .then((response) => {return response.json()})
            .then(data => {console.log(data)})
            // console.log("res2", res)
            return (resObj)
        })
    })
        