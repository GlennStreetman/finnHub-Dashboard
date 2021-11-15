import { createAsyncThunk } from '@reduxjs/toolkit';
import { finnHub, throttleResObj as queResObj, finnHubQueue, throttleApiReqObj } from "../appFunctions/appImport/throttleQueueAPI";

//Receives list of widgets and checks stale dates in slice/datamodel to see if updates are needed.
//If data is not fresh dispatch finnHub api request to throttleQueue.
//Returns finnhub data to mongoDB AND updates slice/ShowData.
export interface tgetFinnHubDataReq {
    dashboardID: number,
    widgetList: string[],
    finnHubQueue: finnHubQueue,
    rSetUpdateStatus: Function,
    forceUpdate?: boolean, //set to true to force update of all requests.
}

export interface resObj {
    [key: string]: queResObj
}

export const tGetFinnhubData = createAsyncThunk( //{endPoint, [securityList]}
    'GetFinnhubData',
    (req: tgetFinnHubDataReq, thunkAPI: any) => { //{dashboard: string, widgetList: []} //receives list of widgets from a dashboard to update.

        const currentDashboard = thunkAPI.getState().currentDashboard

        const finnQueue = req.finnHubQueue
        const dataModel = thunkAPI.getState().dataModel.dataSet[currentDashboard] //finnHubData
        const getWidgets = req.widgetList
        let requestList: Promise<any>[] = []
        for (const w of getWidgets) { //for each widget ID
            const thisWidget = dataModel[w]
            let countQueue = 0
            for (const s in thisWidget) { //for each security
                const reqObj: throttleApiReqObj = {
                    ...thisWidget[s],
                    dashboardID: req.dashboardID,
                    dashboard: currentDashboard,
                    widget: w,
                    security: s,
                    config: thisWidget[s].config,
                    rSetUpdateStatus: req.rSetUpdateStatus,
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
            req.rSetUpdateStatus({ [currentDashboard]: countQueue })
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