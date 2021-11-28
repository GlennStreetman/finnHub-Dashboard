import { createSlice } from '@reduxjs/toolkit';
import { tProcessLogin } from 'src/thunks/thunkProcessLogin'


const initialState: string = ""

const apiAlias = createSlice({
    name: 'apiAlias',
    initialState,
    reducers: {
        rSetApiAlias: (state: string, action: any) => {
            const ap: string = action.payload
            state = ap
            return state
        },
    },
    extraReducers: {
        [tProcessLogin.fulfilled.toString()]: (state: string, action) => {
            const ap = action.payload
            state = ap.apiAlias
            return state
        },
    }
})

export const {
    rSetApiAlias,
} = apiAlias.actions
export default apiAlias.reducer