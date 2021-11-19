import { createAsyncThunk } from '@reduxjs/toolkit';
import { finnHub, throttleResObj as queResObj, finnHubQueue, throttleApiReqObj } from "../appFunctions/appImport/throttleQueueAPI";
// import { rSetUpdateStatus } from 'src/slices/sliceDataModel'

//Receives list of widgets and checks stale dates in slice/datamodel to see if updates are needed.
//If data is not fresh dispatch finnHub api request to throttleQueue.
//Returns finnhub data to mongoDB AND updates slice/ShowData.
export interface tgetFinnHubDataReq {
    currentDashboard: string,
    widgetList: string[],
    finnHubQueue: finnHubQueue,
    forceUpdate?: boolean, //set to true to force update of all requests.
}

export interface resObj {
    [key: string]: queResObj
}

export const tGetFinnhubData = createAsyncThunk( //{endPoint, [securityList]}
    'GetFinnhubData',
    (req: tgetFinnHubDataReq, thunkAPI: any) => { //{dashboard: string, widgetList: []} //receives list of widgets from a dashboard to update.

        const dashboardId = thunkAPI.getState().currentDashboard.dashboardID

        const finnQueue = req.finnHubQueue
        const dataModel = thunkAPI.getState().dataModel.dataSet[req.currentDashboard] //finnHubData
        const getWidgets = req.widgetList
        let requestList: Promise<any>[] = []
        for (const w of getWidgets) { //for each widget ID
            const thisWidget = dataModel[w]
            let countQueue = 0
            for (const s in thisWidget) { //for each security
                const reqObj: throttleApiReqObj = {
                    ...thisWidget[s],
                    dashboardID: dashboardId,
                    dashboard: req.currentDashboard,
                    widget: w,
                    security: s,
                    config: thisWidget[s].config,
                    // rSetUpdateStatus: rSetUpdateStatus,
                }
                if (
                    (reqObj.updated === undefined) ||
                    req.forceUpdate === true ||
                    (Date.now() - reqObj.updated >= 1 * 1000 * 60 * 60 * 3) //more than 3 hours old.
                ) {
                    requestList.push(finnHub(finnQueue, reqObj))
                    countQueue = countQueue + 1
                }
            }
            // rSetUpdateStatus({ [req.currentDashboard]: countQueue })
        }
        return Promise.all(requestList)
            .then((res) => {
                const resObj: resObj = {}
                for (const resStock of res) {
                    const key: string = `${resStock.dashboardID}-${resStock.widget}-${resStock.security}`
                    resObj[key] = resStock
                }
                const options = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(resObj),
                };
                if (Object.keys(resObj).length > 0) {
                    fetch("/postFinnDashDataMongo", options) //cache finnnDash data to mongoDB.
                        .then((response) => {
                            return response.json()
                        })
                        .catch((err) => {
                            console.log('error caching data to mongoDb: ', err)
                        })
                }
                return (resObj) //thunk data returned to dataModel(update stale date) and showdata(retain in redux if marked as visable).
            })
            .catch((err) => {
                console.log('finnDashQueue error:', err)
            })
    })