import { createSlice } from '@reduxjs/toolkit';

export interface menu {
    column: number,
    columnOrder: number,
    widgetConfig: string,
    widgetHeader: string,
    widgetID: string,
    widgetType: string,
    xAxis: string,
    yAxis: string,
    showBody: boolean,
}

export interface sliceMenuList {
    [key: string]: menu
}

const initialState: sliceMenuList = {}

const menuList = createSlice({
    name: 'menuList',
    initialState,
    reducers: {
        rSetMenuList: (state: sliceMenuList, action: any) => {
            const ap: sliceMenuList = action.payload
            return ap
        },
    },
})

export const {
    rSetMenuList,
} = menuList.actions
export default menuList.reducer
