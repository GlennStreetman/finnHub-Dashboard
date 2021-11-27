import { createAsyncThunk } from '@reduxjs/toolkit';
import { filters } from 'src/slices/sliceDashboardData'


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