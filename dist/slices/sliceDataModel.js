import { createSlice } from '@reduxjs/toolkit';
import { widgetDict } from '../registers/endPointsReg';
import { tGetFinnhubData } from '../thunks/thunkFetchFinnhub';
import { tGetMongoDB } from '../thunks/thunkGetMongoDB';
const initialState = {
    dataSet: {},
    status: {},
    created: 'false',
};
const dataModel = createSlice({
    name: 'finnHubData',
    initialState,
    reducers: {
        rBuildDataModel: (state, action) => {
            //receivies dashboard object and builds dataset from scratch.
            const ap = action.payload;
            const apD = ap.dashBoardData;
            // console.log("Building DATASET")
            const endPointAPIList = {}; //list of lists. Each list []
            //create dataSet
            for (const d in apD) { //for each dashboard
                const dashboardName = d;
                state.status[dashboardName] = 'Building';
                endPointAPIList[dashboardName] = {};
                const widgetList = apD[d].widgetlist;
                for (const w in widgetList) { //for each widget
                    const widgetName = w;
                    if (w !== null && w !== 'null') {
                        const endPoint = widgetList[w].widgetType;
                        const filters = widgetList[w].filters;
                        const widgetDescription = widgetList[w].widgetHeader;
                        const widgetType = widgetList[w].widgetType;
                        const config = widgetList[w].config;
                        // @ts-ignore: Unreachable code error
                        const endPointFunction = widgetDict[endPoint]; //returns function that generates finnhub API strings
                        const trackedStocks = widgetList[w].trackedStocks;
                        const endPointData = endPointFunction(trackedStocks, filters, ap.apiKey);
                        delete endPointData.undefined;
                        endPointAPIList[dashboardName][widgetName] = {};
                        for (const stock in endPointData) {
                            endPointAPIList[dashboardName][widgetName][`${stock}`] = {
                                apiString: endPointData[stock],
                                widgetName: widgetDescription,
                                dashboard: dashboardName,
                                widgetType: widgetType,
                                config: config,
                            };
                        }
                    }
                }
            }
            //check for stale date and retain info?????
            state.dataSet = endPointAPIList;
            const flag = state.created === 'false' ? 'true' : 'updated';
            // console.log("UPDATING FLAG", flag)
            state.created = flag;
        },
        rResetUpdateFlag: (state) => {
            // console.log("reseting update flag")
            state.created = 'true';
        },
    },
    extraReducers: {
        // @ts-ignore: Unreachable code error
        [tGetFinnhubData.pending]: (state, action) => {
            // console.log('1. Getting stock data!')
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetFinnhubData.rejected]: (state, action) => {
            console.log('2. failed to retrieve stock data for: ', action);
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetFinnhubData.fulfilled]: (state, action) => {
            // console.log("3 UPDATA DATA STORE:", action.payload)
            const ap = action.payload;
            for (const x in ap) {
                const db = ap[x].dashboard;
                state.status[db] = 'Ready';
                const widget = ap[x].widget;
                const sec = ap[x].security;
                // if (state.dataSet[db] && state.dataSet[db][widget] && state.dataSet[db][widget][sec]) {
                if (state.dataSet?.[db]?.[widget]?.[sec]) {
                    state.dataSet[db][widget][sec]['apiString'] = ap[x].apiString;
                    state.dataSet[db][widget][sec]['updated'] = ap[x].updated;
                }
            }
        },
        // @ts-ignore: Unreachable code error
        [tGetMongoDB.pending]: (state, action) => {
            console.log('1. Getting stock data!');
            // const dashboard: string = action.meta.arg.targetDashBoard
            // state.status[dashboard] = 'Updating'
        },
        // @ts-ignore: Unreachable code error
        [tGetMongoDB.rejected]: (state, action) => {
            console.log('2. failed showData from Mongo: ', action);
            // return {...state}
        },
        // @ts-ignore: Unreachable code error
        [tGetMongoDB.fulfilled]: (state, action) => {
            // console.log("3Merge update fields into dataSet from mongoDB", action)
            const ap = action.payload;
            for (const x in ap) {
                const dashboard = ap[x].dashboard;
                const widget = ap[x].widget;
                const updated = ap[x].updated;
                const stale = ap[x].stale;
                const security = ap[x].security;
                if (state.dataSet?.[dashboard]?.[widget]?.[security]) {
                    state.dataSet[dashboard][widget][security].updated = updated;
                    state.dataSet[dashboard][widget][security].stale = stale;
                }
            }
        },
    }
});
export const { rBuildDataModel, rResetUpdateFlag, } = dataModel.actions;
export default dataModel.reducer;
//# sourceMappingURL=sliceDataModel.js.map