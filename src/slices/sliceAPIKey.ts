import { createSlice } from '@reduxjs/toolkit';

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
})

export const {
    rSetApiKey,
} = apiKey.actions
export default apiKey.reducer