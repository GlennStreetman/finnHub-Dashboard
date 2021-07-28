import { useEffect } from "react";


export const useUpdateFocus = function ( //on update to p.targetFocus update p.config.targetSecurity

    newFocus: string, //p.targetSecurity
    updateWidgetConfig: Function, //p.updateWidgetConfig
    key: number, // p.widgetKey, 
    isInitialMount: any, //p.config.targetSecurity
    config: any,
) {

    useEffect(() => { //Setup default metric source if none selected or not in list of target stocks
        if (newFocus && newFocus !== '' && config.targetSecurity !== newFocus) { // && sInitialMount.current !== true 
            const payload = { targetSecurity: newFocus }
            updateWidgetConfig(key, payload)
        }
    }, [newFocus, key, updateWidgetConfig]) //targetSecurity
}