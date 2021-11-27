import { createSlice } from '@reduxjs/toolkit';

const initialState: string = ""

const currentDashboard = createSlice({
    name: 'currentDashboard',
    initialState,
    reducers: {
        rUpdateCurrentDashboard: (state: string, action: any) => {
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