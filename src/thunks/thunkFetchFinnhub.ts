import { createAsyncThunk } from '@reduxjs/toolkit';
import { finnHub, resObj as queResObj } from "../appFunctions/throttleQueueAPI";

//Receives list of widgets to check for updates from target dashboard.
//If data is not fresh dispatch api request.
//sends finnhub data to mongoDB AND updates sliceShowData & slicefinnHubData
export interface reqObj {
    targetDashBoard: string,
    widgetList: string[]
}

export interface resObj {
    [key: string]: queResObj
}

export const tGetFinnhubData = createAsyncThunk( //{endPoint, [securityList]}
    'GetFinnhubData',
    (req: reqObj, thunkAPI: any) => { //{dashboard: string, widgetList: []} //receives list of widgets from a dashboard to update.
        const finnQueue = thunkAPI.getState().finnHubQueue.throttle
        const dataModel = thunkAPI.getState().dataModel.dataSet[req.targetDashBoard] //finnHubData
        // const thisDashboard = dataModel.dataSet[req.targetDashBoard]
        const getWidgets = req.widgetList
        let requestList: Promise<any>[] = []
        for (const w of getWidgets) { //for each widget
            const thisWidget = dataModel[w]
            for (const s in thisWidget) { //for each security
                const reqObj = { ...thisWidget[s] }
                reqObj.dashboard = req.targetDashBoard
                reqObj.widget = w
                reqObj.security = s
                // console.log('---------------------1req OBJ----------------------', reqObj)
                if (
                    (reqObj.updated === undefined) ||
                    (Date.now() - reqObj.updated >= 1 * 1000 * 60 * 60 * 3) //more than 3 hours old.
                ) {
                    requestList.push(finnHub(finnQueue, reqObj))
                }
            }
        }
        console.log("finnHub Request List: ", requestList)
        return Promise.all(requestList)
            .then((res) => {
                const resObj: resObj = {}
                for (const resStock of res) {
                    const key: string = `${resStock.dashboard}-${resStock.widget}-${resStock.security}`
                    resObj[key] = resStock
                }
                // console.log('resObj', resObj)
                const options = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(resObj),
                };
                fetch("/finnDashData", options)
                    .then((response) => { return response.json() })
                    .then(() => {
                        console.log('finndash data saved to mongoDB.')
                    })
                return (resObj)
            })
    })