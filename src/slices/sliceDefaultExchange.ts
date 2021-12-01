import { createSlice } from '@reduxjs/toolkit';
import { tProcessLogin } from 'src/thunks/thunkProcessLogin'

const initialState: string = ""

const defaultExchange = createSlice({
    name: 'defaultExchange',
    initialState,
    reducers: {
        rSetDefaultExchange: (state: string, action: any) => {
            const ap: string = action.payload
            state = ap ? ap : ''
            return state
        },
    },
    extraReducers: {
        [tProcessLogin.fulfilled.toString()]: (state: string, action) => {
            const ap = action.payload
            state = ap.defaultexchange
            return state
        },
    }
})

export const {
    rSetDefaultExchange,
} = defaultExchange.actions
export default defaultExchange.reducer