import { createSlice } from '@reduxjs/toolkit';
import { tSyncGlobalStocklist } from 'src/thunks/thunkSyncGlobalStockList'

const initialState: string = ""

const targetSecurity = createSlice({
    name: 'targetSecurity',
    initialState,
    reducers: {
        rSetTargetSecurity: (state: string, action: any) => {
            const ap: string = action.payload
            state = ap ? ap : ''
            return state
        },
    },
    extraReducers: {
        [tSyncGlobalStocklist.fulfilled.toString()]: (state, action) => {
            const ap: string = action.payload.targetSecurity
            state = ap ? ap : ''
            return state
        },
    }
})

export const {
    rSetTargetSecurity,
} = targetSecurity.actions
export default targetSecurity.reducer