import { useEffect } from "react";
import { UpdateWidgetFilters } from 'src/appFunctions/appImport/widgetLogic'
import { dashBoardData } from 'src/App'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

export const useStartingFilters = function (//sets default filters, if not setup.

    checkValue: string | number, //filters['valueToCheck']
    updateObj: Object,
    widgetID: string | number, //p.widgetKey
    dashBoardData: dashBoardData,
    currentDashBoard: string,
    dispatch: Function,
    apiKey: string,
    finnHubQueue: finnHubQueue,

) {
    useEffect(() => {
        if (checkValue === undefined) { //if filters not saved to props
            UpdateWidgetFilters(widgetID, updateObj, dashBoardData, currentDashBoard, dispatch, apiKey, finnHubQueue)
        }
    }, [])
}

