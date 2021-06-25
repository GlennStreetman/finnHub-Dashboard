import { useEffect } from "react";

export const useStartingFilters = function ( //on update to p.targetFocus update p.config.targetSecurity

    checkValue: string, //filters['valueToCheck']
    updateObj: Object,
    update: Function, //p.updateWidgetFilters, 
    key: number, //p.widgetKey

) {
    useEffect(() => {
        if (checkValue === undefined) { //if filters not saved to props
            update(key, updateObj)
        }
    }, [checkValue, updateObj, update, key])
}
