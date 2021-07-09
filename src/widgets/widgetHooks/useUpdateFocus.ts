import { useEffect } from "react";


export const useUpdateFocus = function ( //on update to p.targetFocus update p.config.targetSecurity

    newFocus: string, //p.targetSecurity
    updateWidgetConfig: Function, //p.updateWidgetConfig
    key: number, // p.widgetKey, 
) {
    useEffect(() => { //Setup default metric source if none selected or not in list of target stocks
        console.log(newFocus,)
        const payload = { targetSecurity: newFocus }
        if (newFocus && newFocus !== '') updateWidgetConfig(key, payload)
    }, [newFocus, key, updateWidgetConfig])
}