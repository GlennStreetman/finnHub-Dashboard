import { createSlice } from '@reduxjs/toolkit';

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
})

export const {
    rSetApiAlias,
} = apiAlias.actions
export default apiAlias.reducer