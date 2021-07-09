import { useEffect } from "react";


export const useUpdateFocus = function ( //on update to p.targetFocus update p.config.targetSecurity

    newFocus: string, //p.targetSecurity
    updateWidgetConfig: Function, //p.updateWidgetConfig
    key: number, // p.widgetKey, 
    targetSecurity: string,
) {
    useEffect(() => { //Setup default metric source if none selected or not in list of target stocks
        console.log('newFocus', newFocus)
        const payload = { targetSecurity: newFocus }
        if (newFocus && newFocus !== '' && newFocus !== targetSecurity) updateWidgetConfig(key, payload)
    }, [newFocus, key, updateWidgetConfig, targetSecurity])
}