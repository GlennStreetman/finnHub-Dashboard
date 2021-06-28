import { useEffect } from "react";


//updates widgets config.targetSecurity for any widget that uses a target security.
export const useTargetSecurity = function (

    key: number, // p.widgetKey, 
    trackedStocks, //p.trackedStocks, 
    updateWidgetConfig: Function,  //p.updateWidgetConfig
    targetSecurity: string, //
) {
    useEffect(() => { //Setup default metric source if none selected or not in list of target stocks
        const keyList = Object.keys(trackedStocks)
        if (!targetSecurity || !Object.keys(trackedStocks).includes(targetSecurity)) {
            const newTarget: string = keyList.length > 0 ? trackedStocks[keyList[0]].key : ''
            const payload = {
                targetSecurity: newTarget,
            }
            updateWidgetConfig(key, payload)
        }
    }, [key, trackedStocks, updateWidgetConfig, targetSecurity])
}
