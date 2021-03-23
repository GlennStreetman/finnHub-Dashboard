import { createAsyncThunk } from '@reduxjs/toolkit';
import  {finnHub} from "./../appFunctions/throttleQueueAPI";

//receives list of keys to be retrieved from finnHub as an parameter.
//If data is not fresh dispatch api request.
//sends finnhub data to mongoDB AND updates sliceShowData & slicefinnHubData
export const tGetFinnhubData = createAsyncThunk( //{endPoint, [securityList]}
    'GetFinnhubData',
    (req, thunkAPI) => { //l{ist of securities} )
        const finnQueue = thunkAPI.getState().finnHubQueue.throttle
        const dataModel = thunkAPI.getState().dataModel.dataSet //finnHubData
        let requestList = []  
        console.log("Process updates", req, dataModel)
        for (const ep in req) { //for each widget
            const reqKey = req[ep] 
            const reqObj = dataModel[reqKey]
            console.log(reqKey,reqObj)
            const endPoint = reqObj.apiString
            if (
                (reqObj.updated === undefined) ||
                (Date.now() - reqObj.updated >= 1*1000*60*60*3) //more than 3 hours old.
            ) {
                requestList.push(finnHub(finnQueue, endPoint, reqKey))
            }   
        }
        console.log("finnHub Request List: ", requestList)
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
            // console.log('resObj', resObj)
            //send to mongoDB HERE  
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resObj),
                };
            // console.log("Sending mongoDB updates", options)
            fetch("/finnDashData", options)
            .then((response) => {return response.json()})
            .then(data => {
                console.log('finndash data saved to mongoDB.')
            })
            // console.log("res2", res)
            return (resObj)
        })
    })