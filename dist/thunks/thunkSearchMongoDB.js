import { createAsyncThunk } from '@reduxjs/toolkit';
//receives list of strings to search for.
//pushes returned string to visableData in redux.
export const tSearchMongoDB = createAsyncThunk(//{dashboard, [securityList]}
'tSearch', async (req, thunkAPI) => {
    //if stale pop from list 
    const dashboard = thunkAPI.getState().showData.targetDashboard;
    const reqData = {
        searchList: req,
        dashboard: dashboard
    };
    try {
        // const ap = req.payload
        // console.log("Get Mongo Data")
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqData),
        };
        // console.log("Searching mongoDB with: ", options, req)
        const getData = await fetch('/findMongoData', options);
        const resData = await getData.json();
        // const setData = resData[0].data
        console.log('setData', resData);
        const res = {};
        for (const x in resData) {
            const mongo = resData[x];
            res[mongo.key] = {
                updated: mongo.retrieved,
                stale: mongo.stale,
                data: mongo.data,
                key: mongo.key,
                dashboard: mongo.dashboard,
                widget: mongo.widget,
                security: mongo.security,
            };
        }
        console.log('thunk Search Mongo', res);
        return (res);
    }
    catch (err) {
        console.log('Error retrieving mongoDB', err);
        return ('Problem retrieving mongo data');
    }
});
//# sourceMappingURL=thunkSearchMongoDB.js.map