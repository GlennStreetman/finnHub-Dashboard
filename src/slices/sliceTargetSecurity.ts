import { createSlice } from '@reduxjs/toolkit';

const initialState: string = ""

const targetSecurity = createSlice({
    name: 'targetSecurity',
    initialState,
    reducers: {
        rSetTargetSecurity: (state: string, action: any) => {
            const ap: string = action.payload
            state = ap
            return state
        },
    },
})

export const {
    rSetTargetSecurity,
} = targetSecurity.actions
export default targetSecurity.reducer