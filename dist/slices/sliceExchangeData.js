import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { finnHub } from "./../appFunctions/throttleQueue";
export const tGetSymbolList = createAsyncThunk('newSymbolList', (reqObj, thunkAPI) => {
    const finnQueue = thunkAPI.getState().finnHubQueue.throttle;
    const apiString = `https://finnhub.io/api/v1/stock/symbol?exchange=${reqObj.exchange}&token=${reqObj.apiKey}`;
    // console.log('GETTING exchange data', reqObj.exchange, reqObj.apiKey, apiString)
    return finnHub(finnQueue, apiString) //replace with usestate.
        .then((data) => {
        if (data.error === 429) { //run again
            tGetSymbolList(reqObj);
            return {
                'data': {},
                'ex': reqObj.exchange,
            };
        }
        else {
            let updateStockList = {};
            for (const stockObj in data) {
                data[stockObj]['exchange'] = reqObj.exchange;
                let addStockKey = reqObj.exchange + "-" + data[stockObj]['symbol'];
                updateStockList[addStockKey] = data[stockObj];
                updateStockList[addStockKey]['key'] = addStockKey;
            }
            return {
                'data': updateStockList,
                'ex': reqObj.exchange,
            };
        }
    });
});
const exchangeData = createSlice({
    name: 'exchangedata',
    initialState: {
        e: {}
    },
    reducers: {
        rUpdateExchangeData: (state, action) => {
            const ap = action.payload;
            // console.log("UPDATING EXCHANGE LIST", ap)
            state.exchangeData = ap;
        },
    },
    extraReducers: {
        [tGetSymbolList.pending]: (state) => {
            // console.log('1 getting stock data')
            return state;
        },
        [tGetSymbolList.rejected]: (state, action) => {
            console.log('failed to retrieve stock data for: ', action);
            return state;
        },
        [tGetSymbolList.fulfilled]: (state, action) => {
            try {
                let data = action.payload;
                const updateObj = {
                    ex: data.ex,
                    data: data.data,
                    updated: Date.now(),
                };
                // console.log('updateObj', updateObj, data)
                if (updateObj.ex !== undefined) {
                    // console.log("UPDATING", updateObj)
                    state.e = updateObj;
                }
            }
            catch {
                console.log('failed to retrieve exchange data');
            }
        }
    }
});
export const { rUpdateExchangeData, } = exchangeData.actions;
export default exchangeData.reducer;
//# sourceMappingURL=sliceExchangeData.js.map