import { createSlice } from '@reduxjs/toolkit';

const initialState: string = ""

const saveDashboardFlag = createSlice({
    name: 'saveDashboardFlag',
    initialState,
    reducers: {
        rSaveDashboardFlag: (state: string, action: any) => {
            const ap: string = action.payload
            state = ap
            return state
        },
    },
})

export const {
    rSaveDashboardFlag,
} = saveDashboardFlag.actions
export default saveDashboardFlag.reducer