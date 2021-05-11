import { createSlice } from '@reduxjs/toolkit';
import { createFunctionQueueObject } from "../appFunctions/throttleQueueAPI";

const finnHubQueue = createSlice({
    name: 'finnQueue',
    initialState: {
        throttle: createFunctionQueueObject(30, 1000, true), //all finnhub API requests should be done with finnHub function.
    },
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        rUpdateRateLimit: (state, action) => {
            //receives object {a = throttle.action b= params}
            const s = state
            const ap = action.payload
            if (s.throttle.evenlySpaced) {
                s.throttle.interval = 1000 / ap;
                s.throttle.maxRequestPerInterval = 1;
            } else {
                s.throttle.interval = 1000
                s.throttle.maxRequestPerInterval = ap;
            }
        },

    },
})

export const {
    rUpdateRateLimit,
} = finnHubQueue.actions
export default finnHubQueue.reducer
