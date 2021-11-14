import { createSlice } from '@reduxjs/toolkit';

const initialState: string = ""

const currentDashboard = createSlice({
    name: 'currentDashboard',
    initialState,
    reducers: {
        rUpdateCurrentDashboard: (state: string, action: any) => {
            const ap: string = action.payload
            console.log('AP', ap)
            state = ap
            console.log('state', state)
            return state
        },
    },
})

export const {
    rUpdateCurrentDashboard,
} = currentDashboard.actions
export default currentDashboard.reducer
