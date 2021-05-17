import { createSlice } from '@reduxjs/toolkit';

export interface sliceExchangeList {
    exchangeList: string[]
}

const startingState: sliceExchangeList = {
    exchangeList: [], //list of active exchanges
}

export interface rUpdateExchangeListPayload {
    exchangeList: string[]
}

const exchangeList = createSlice({
    name: 'exchangeList',
    initialState: startingState,
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        rUpdateExchangeList: (state: sliceExchangeList, action) => {
            const ap: rUpdateExchangeListPayload = action.payload
            const s = state
            return { ...s, exchangeList: ap.exchangeList }
        },
        rExchangeListLogout: (state) => {
            state.exchangeList = []
        }
    },
})

export const {
    rUpdateExchangeList,
    rExchangeListLogout,
} = exchangeList.actions
export default exchangeList.reducer