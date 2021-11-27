import { createSlice } from '@reduxjs/toolkit';

const initialState: string = ""

const saveDashboardThrottle = createSlice({
    name: 'saveDashboardThrottle',
    initialState,
    reducers: {
        rSaveDashboardThrottle: (state: string, action: any) => {
            const ap: string = action.payload
            state = ap
            return state
        },
    },
})

export const {
    rSaveDashboardThrottle,
} = saveDashboardThrottle.actions
export default saveDashboardThrottle.reducer