import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: string = ""

const currentDashboard = createSlice({
    name: 'currentDashboard',
    initialState,
    reducers: {
        rUpdateCurrentDashboard: (state: string, action: PayloadAction<string>) => {
            const ap: string = action.payload
            state = ap
            return state
        },
    },
})

export const {
    rUpdateCurrentDashboard,
} = currentDashboard.actions
export default currentDashboard.reducer