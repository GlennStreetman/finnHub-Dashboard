import { createSlice } from '@reduxjs/toolkit';
import { tProcessLogin } from 'src/thunks/thunkProcessLogin'

const initialState: string = ""

const apiKey = createSlice({
    name: 'apiKey',
    initialState,
    reducers: {
        rSetApiKey: (state: string, action: any) => {
            const ap: string = action.payload
            state = ap
            return state
        },
    },
    extraReducers: {
        [tProcessLogin.fulfilled.toString()]: (state: string, action) => {
            const ap = action.payload
            state = ap.apiKey
            return state
        },
    }
})

export const {
    rSetApiKey,
} = apiKey.actions
export default apiKey.reducer