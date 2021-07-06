import { createAsyncThunk } from '@reduxjs/toolkit';
import { finnHub, throttleResObj as queResObj, finnHubQueue } from "../appFunctions/appImport/throttleQueueAPI";

//Receives list of widgets and checks stale dates in slice/datamodel to see if updates are needed.
//If data is not fresh dispatch finnHub api request to throttleQueue.
//Returns finnhub data to mongoDB AND updates slice/ShowData.
export interface tgetFinnHubDataReq {
    targetDashBoard: string,
    widgetList: string[],
    finnHubQueue: finnHubQueue,
}

export interface resObj {
    [key: string]: queResObj
}

export const tGetFinnhubData = createAsyncThunk( //{endPoint, [securityList]}
    'GetFinnhubData',
    (req: tgetFinnHubDataReq, thunkAPI: any) => { //{dashboard: string, widgetList: []} //receives list of widgets from a dashboard to update.
        const finnQueue = req.finnHubQueue
        const dataModel = thunkAPI.getState().dataModel.dataSet[req.targetDashBoard] //finnHubData
        const getWidgets = req.widgetList
        let requestList: Promise<any>[] = []
        for (const w of getWidgets) { //for each widget ID
            const thisWidget = dataModel[w]
            for (const s in thisWidget) { //for each security
                const reqObj = { ...thisWidget[s] }
                reqObj.dashboard = req.targetDashBoard
                reqObj.widget = w
                reqObj.security = s
                reqObj.config = thisWidget[s].config
                if (
                    (reqObj.updated === undefined) ||
                    (Date.now() - reqObj.updated >= 1 * 1000 * 60 * 60 * 3) //more than 3 hours old.
                ) {
                    requestList.push(finnHub(finnQueue, reqObj))
                }
            }
        }

        return Promise.all(requestList)
            .then((res) => {
                const resObj: resObj = {}
                for (const resStock of res) {

                    const key: string = `${resStock.dashboard}-${resStock.widget}-${resStock.security}`
                    resObj[key] = resStock
                }
                const options = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(resObj),
                };
                fetch("/finnDashData", options) //cache finnnDash data to mongoDB.
                    .then((response) => {
                        return response.json()
                    })
                return (resObj) //thunk data returned to dataModel(update stale date) and showdata(retain in redux if marked as visable).
            })
            .catch((err) => {
                console.log('finnDashQueue error:', err)
            })
    })