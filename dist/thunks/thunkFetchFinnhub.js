import { createAsyncThunk } from '@reduxjs/toolkit';
import { finnHub } from "../appFunctions/throttleQueueAPI";
export const tGetFinnhubData = createAsyncThunk(//{endPoint, [securityList]}
'GetFinnhubData', (req, thunkAPI) => {
    const finnQueue = thunkAPI.getState().finnHubQueue.throttle;
    const dataModel = thunkAPI.getState().dataModel.dataSet[req.targetDashBoard]; //finnHubData
    // const thisDashboard = dataModel.dataSet[req.targetDashBoard]
    const getWidgets = req.widgetList;
    console.log('getWidgets', getWidgets);
    let requestList = [];
    for (const w of getWidgets) { //for each widget ID
        const thisWidget = dataModel[w];
        console.log('THIS WIDGET', thisWidget);
        for (const s in thisWidget) { //for each security
            const reqObj = { ...thisWidget[s] };
            reqObj.dashboard = req.targetDashBoard;
            reqObj.widget = w;
            reqObj.security = s;
            reqObj.config = thisWidget[s].config;
            console.log('---------------------1req OBJ----------------------', reqObj);
            if ((reqObj.updated === undefined) ||
                (Date.now() - reqObj.updated >= 1 * 1000 * 60 * 60 * 3) //more than 3 hours old.
            ) {
                requestList.push(finnHub(finnQueue, reqObj));
            }
        }
    }
    return Promise.all(requestList)
        .then((res) => {
        const resObj = {};
        for (const resStock of res) {
            const key = `${resStock.dashboard}-${resStock.widget}-${resStock.security}`;
            resObj[key] = resStock;
        }
        console.log('resObj', resObj);
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resObj),
        };
        fetch("/finnDashData", options)
            .then((response) => { return response.json(); })
            .then(() => {
            console.log('finndash data saved to mongoDB.', resObj);
        });
        return (resObj);
    });
});
//# sourceMappingURL=thunkFetchFinnhub.js.map