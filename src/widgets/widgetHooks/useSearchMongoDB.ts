import { useEffect } from "react";
import { tSearchMongoDB } from '../../thunks/thunkSearchMongoDB'
//updates widgets config.targetSecurity for any widget that uses a target security.
export const useSearchMongoDb = function (
    targetSecurity: string, //p.config.targetSecurity
    widgetKey: string, //p.widgetKey 
    widgetCopy: string,
    dispatch: Function, //Dispatch()
    isInitialMount,
) {
    useEffect(() => { //on change to targetSecurity rebuild data set.
        if (isInitialMount.current === true && widgetCopy === widgetKey) {
            console.log('pass')
        } else if (targetSecurity && targetSecurity !== '') {
            const target = `${widgetKey}-${targetSecurity}`
            dispatch(tSearchMongoDB([target]))
        }
    }, [targetSecurity, widgetKey, dispatch, isInitialMount, widgetCopy])
}

//CONDITIONS THAT ONE OF MUST RETURN FALSE