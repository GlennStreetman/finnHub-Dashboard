import { createAsyncThunk } from '@reduxjs/toolkit';
import  {finnHub} from "./../appFunctions/throttleQueueAPI";

//Receives list of widgets to check for updates from target dashboard.
//If data is not fresh dispatch api request.
//sends finnhub data to mongoDB AND updates sliceShowData & slicefinnHubData
export const tGetFinnhubData = createAsyncThunk( //{endPoint, [securityList]}
    'GetFinnhubData',
    (req, thunkAPI) => { //{dashboard: string, widgetList: []} //receives list of widgets from a dashboard to update.
        console.log("GET FINNHUB DATA", req)
        const finnQueue = thunkAPI.getState().finnHubQueue.throttle
        const dataModel = thunkAPI.getState().dataModel.dataSet[req.targetDashBoard] //finnHubData
        // const thisDashboard = dataModel.dataSet[req.targetDashBoard]
        const getWidgets = req.widgetList
        // console.log(req)
        let requestList = []  
        for (const w of getWidgets) { //for each widget
            const thisWidget = dataModel[w]
            for (const s in thisWidget) { //for each security
                const reqObj = {...thisWidget[s]} 
                reqObj.dashboard = req.targetDashBoard
                reqObj.widget = w
                reqObj.security = s
                // console.log('1req OBJ', reqObj)
                if (
                    (reqObj.updated === undefined) ||
                    (Date.now() - reqObj.updated >= 1*1000*60*60*3) //more than 3 hours old.
                ) {
                    requestList.push(finnHub(finnQueue, reqObj))
                }   
            }   
        }
        console.log("finnHub Request List: ", requestList)
        return Promise.all(requestList)
        .then((res) => {
            console.log("DONE",res)
            const resObj = {}
            for (const resStock of res) {
                const key = `${resStock.dashboard}-${resStock.widget}-${resStock.security}`
                resObj[key] = {}
                resObj[key].apiString = resStock.apiString
                resObj[key].data = resStock.data
                resObj[key].updated = Date.now()
                resObj[key].dashboard =resStock.dashboard
                resObj[key].description = resStock.description
                resObj[key].widget = resStock.widget
                resObj[key].security = resStock.security
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
            .then(() => {
                console.log('finndash data saved to mongoDB.')
            })
            // console.log("res2", res)
            return (resObj)
        })
    })