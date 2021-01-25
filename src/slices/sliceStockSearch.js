import { createSlice } from '@reduxjs/toolkit';

const stockSearch = createSlice({
    name: 'exchangeList',
    initialState: {
        searchText: '', //text used to search for a stock
    },
    reducers: { //reducers can reference eachother with slice.caseReducers.reducer(state)
        rUpdateText: (state, action) => {
            const ap = action.payload
            const s = state
            return {...s, searchText: ap.inputText}  
        },
    },
})

export const {
    rUpdateText,
} = stockSearch.actions
export default stockSearch.reducer