import { createAsyncThunk } from '@reduxjs/toolkit';
import { rebuildTargetWidgetPayload } from 'src/slices/sliceDataModel'
import { sliceDashboardData } from 'src/slices/sliceDashboardData'
// import { sliceMenuList } from './../slices/sliceMenuList'
// import { sliceDashboardData } from './../slices/sliceDashboardData'
// import { widgetList } from './../slices/sliceDashboardData'
import { AppState, setApp } from 'src/App'
import { filters } from 'src/slices/sliceDashboardData'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

interface tUpdateWidgetFiltersReq {
    currentDashboard: string,
    widgetID: string,
    filters: filters,
}

export const tUpdateWidgetFilters = createAsyncThunk(
    'tUpdateWidgetFilters',
    async (req: tUpdateWidgetFiltersReq, thunkAPI: any) => {

        const apiKey = thunkAPI.getState().apiKey

        fetch(`/deleteFinnDashData?widgetID=${req.widgetID}`) //delete data from mongo related to widget.

        return {
            currentDashboard: req.currentDashboard,
            widgetID: req.widgetID,
            filters: req.filters,
            apiKey: apiKey,
        }
    })
