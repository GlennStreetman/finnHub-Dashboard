import { createSlice } from '@reduxjs/toolkit';
import { tChangeWidgetName } from '../thunks/thunkChangeWidgetName'

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
            state = ap
            return state
        },
    },
    extraReducers: {
        [tChangeWidgetName.pending.toString()]: (state) => {
            return state
        },
        [tChangeWidgetName.rejected.toString()]: (state, action) => {
            console.log('failed to update widget name: ', action)
            return state
        },
        [tChangeWidgetName.fulfilled.toString()]: (state, action) => {
            try {
                if (action.payload.rSetMenuList) {
                    let data = action.payload.rSetMenuList
                    state = data
                }
            } catch {
                console.log('redux error updating state.')
            }
        }
    },
})

export const {
    rSetMenuList,
} = menuList.actions
export default menuList.reducer


// extraReducers: {
//     [tChangeWidgetName.pending.toString()]: (state) => {
//         return state
//     },
//     [tChangeWidgetName.rejected.toString()]: (state, action) => {
//         console.log('failed to update widget name: ', action)
//         return state
//     },
//     [tChangeWidgetName.fulfilled.toString()]: (state, action) => {
//         try {
//             if (action.payload.rSetMenuList) {
//                 let data = action.payload.rSetMenuList
//                 state = data
//             }
//         } catch {
//             console.log('redux error updating state.')
//         }
//     }
// }