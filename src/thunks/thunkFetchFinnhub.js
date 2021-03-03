import { createAsyncThunk } from '@reduxjs/toolkit';
import  {finnHub} from "./../appFunctions/throttleQueueAPI.js";
const _ = require('lodash')

export const tUpdateDashboardData = createAsyncThunk( //{endPoint, [securityList]}
    'rEnqueue',
    (req, thunkAPI) => { //l{ist of securities} 
    // console.log("!1REQ", req)
        const finnQueue = thunkAPI.getState().finnHubQueue.throttle //finnHubData
        let requestList = []  //for each request check if data is avaiable.
        for (const widget in req.endPoint) { //for each widget
            
            const widgetName = widget
            const thisWidget = req.endPoint[widget]
            // console.log("!2", widgetName, thisWidget)
            for(const stock in thisWidget) { //for each stock in widget
                // console.log("!3", stock, thisWidget[stock])
                const thisStock = thisWidget[stock]
                if (
                    (thisStock.updated === undefined) ||
                    (Date.now() - thisStock.updated >= 1*1000*60*60*3) //more than 3 hours old.
                ) {//DATA NOT STALE 
                    // console.log("STALE DATA DETECTED.")
                    const requestID = {
                        key: thisStock.key,
                        endPoint: req.endPointName,
                        widgetID: widgetName,
                        thisStock: thisStock,
                        }
                    // console.log("!4", thisStock.apiString, requestID)
                    requestList.push(finnHub(finnQueue, thisStock.apiString, requestID))
                }   
            }
        }
        // console.log('requestList: ', requestList)
        return Promise.all(requestList)
        .then((res) => {
            // console.log("res",res)
            const resObj = {dataSet: {}}
            for (const resStock of res) {
                resObj.dataSet[resStock.endPoint] = {}
            }
            // console.log("RESPONSE1:", resObj)
            for (const resStock of res) {
                const thisEndPoint = resStock.endPoint
                const thisWidget = resStock.widgetID
                resObj.dataSet[thisEndPoint][thisWidget] = {}
            }

            for (const resStock of res) {
                const thisEndPoint = resStock.endPoint
                const thisWidget = resStock.widgetID
                const stockInfo = _.cloneDeep(resStock.thisStock)
                const data =  _.cloneDeep(resStock.data)
                const thisKey = resStock.key
                stockInfo.data = data
                stockInfo.updated = Date.now()
                resObj.dataSet[thisEndPoint][thisWidget][thisKey] = stockInfo
            }

            return (resObj)
        })
    })
        