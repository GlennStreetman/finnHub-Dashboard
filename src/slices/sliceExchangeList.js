import { createSlice } from '@reduxjs/toolkit';

const exchangeList = createSlice({
    name: 'exchangeList',
    initialState: {
        exchangeList: [], //list of active exchanges
    },
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        rUpdateExchangeList: (state, action) => {
            const ap = action.payload
            const s = state
            return {...s, exchangeList: ap.exchangeList}  
        },
    },
})

export const {
    rUpdateExchangeList,
} = exchangeList.actions
export default exchangeList.reducer