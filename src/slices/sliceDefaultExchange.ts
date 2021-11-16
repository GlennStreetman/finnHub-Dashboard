import { createSlice } from '@reduxjs/toolkit';

const initialState: string = ""

const defaultExchange = createSlice({
    name: 'defaultExchange',
    initialState,
    reducers: {
        rSetDefaultExchange: (state: string, action: any) => {
            const ap: string = action.payload
            state = ap
            return state
        },
    },
})

export const {
    rSetDefaultExchange,
} = defaultExchange.actions
export default defaultExchange.reducer
