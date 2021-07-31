import { useEffect } from "react";

export const useStartingFilters = function (//sets default filters, if not setup.

    checkValue: string, //filters['valueToCheck']
    updateObj: Object,
    update: Function, //p.updateWidgetFilters, 
    key: number, //p.widgetKey

) {
    useEffect(() => {
        if (checkValue === undefined) { //if filters not saved to props
            console.log('use starting filters', key, updateObj)
            update(key, updateObj)
        }
    }, [checkValue, updateObj, update, key])
}
