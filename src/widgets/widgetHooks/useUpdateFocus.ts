import { useEffect } from "react";
import { updateWidgetConfig } from 'src/appFunctions/appImport/widgetLogic'
import { dashBoardData } from 'src/App'


export const useUpdateFocus = function ( //on update to p.targetFocus update p.config.targetSecurity

    newFocus: string, //p.targetSecurity
    key: number, // p.widgetKey, 
    config: any,
    dashBoardData: dashBoardData,
    currentDashBoard: string,
    enableDrag: boolean,
    updateAppState: Function,
) {

    useEffect(() => { //Setup default metric source if none selected or not in list of target stocks
        if (newFocus && newFocus !== '' && config.targetSecurity !== newFocus) { // && sInitialMount.current !== true 
            const payload = { targetSecurity: newFocus }
            updateWidgetConfig(
                key,
                payload,
                dashBoardData,
                currentDashBoard,
                enableDrag,
                updateAppState
            )
        }
    }, [newFocus, key]) //targetSecurity
}