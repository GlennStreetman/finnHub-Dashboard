import { useEffect } from "react";
import { UpdateWidgetFilters } from 'src/appFunctions/appImport/widgetLogic'
import { dashBoardData } from 'src/App'
import { rRebuildTargetWidgetModel } from 'src/slices/sliceDataModel'
import { tGetFinnhubData } from 'src/thunks/thunkFetchFinnhub'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { rSetUpdateStatus } from 'src/slices/sliceDataModel'

export const useStartingFilters = function (//sets default filters, if not setup.

    checkValue: string, //filters['valueToCheck']
    updateObj: Object,
    widgetID: string | number, //p.widgetKey
    dashBoardData: dashBoardData,
    currentDashBoard: string,
    updateAppState: Function,
    dispatch: Function,
    apiKey: string,
    finnHubQueue: finnHubQueue,
    saveDashboard: Function,

) {
    useEffect(() => {
        if (checkValue === undefined) { //if filters not saved to props
            UpdateWidgetFilters(widgetID, updateObj, dashBoardData, currentDashBoard, updateAppState, dispatch, apiKey, finnHubQueue, saveDashboard)
        }
    }, [])
}

