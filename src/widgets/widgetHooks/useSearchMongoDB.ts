import { useEffect } from "react";
import { tSearchMongoDB } from '../../thunks/thunkSearchMongoDB'
//updates widgets config.targetSecurity for any widget that uses a target security.
export const useSearchMongoDb = function (
    targetSecurity: string, //p.config.targetSecurity
    widgetKey: string, //p.widgetKey 
    dispatch: Function, //Dispatch()
) {
    useEffect(() => { //on change to targetSecurity rebuild data set.
        if (targetSecurity && targetSecurity !== '') {
            const target = `${widgetKey}-${targetSecurity}`
            dispatch(tSearchMongoDB([target]))
        }
    }, [targetSecurity, widgetKey, dispatch])
}
