import { createSlice } from '@reduxjs/toolkit';
import  {createFunctionQueueObject} from "./../appFunctions/throttleQueueAPI";

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
            s.throttle.updateInterval(ap)
            return state
        },

        rEnqueue (state, action) {
            const s = state
            const ap = action.payload
            s.throttle[ap.a] = ap.b

            return state
        },

    },
})

export const {
    rUpdateRateLimit,
} = finnHubQueue.actions
export default finnHubQueue.reducer
