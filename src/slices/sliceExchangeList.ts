import { createSlice } from '@reduxjs/toolkit';

interface exchangeListState {
    exchangeList: string[]
}

const startingState: exchangeListState = {
    exchangeList: [], //list of active exchanges
}

export interface rUpdateExchangeListPayload {
    exchangeList: string[]
}

const exchangeList = createSlice({
    name: 'exchangeList',
    initialState: startingState,
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        rUpdateExchangeList: (state: exchangeListState, action) => {
            const ap: rUpdateExchangeListPayload = action.payload
            const s = state
            return { ...s, exchangeList: ap.exchangeList }
        },
    },
})

export const {
    rUpdateExchangeList,
} = exchangeList.actions
export default exchangeList.reducer