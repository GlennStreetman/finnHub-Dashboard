import { useEffect } from "react";
import { rBuildVisableData } from '../../slices/sliceShowData'
//updates widgets config.targetSecurity for any widget that uses a target security.
export const useBuildVisableData = function (
    targetSecurity, //p?.config?.targetSecurity
    widgetKey, //p.widgetKey
    widgetCopy, // widgetCopy from drag function OR widgetKey 
    dispatch, // Dispatch()
    isInitialMount, //const isInitialMount
) {
    useEffect(() => {//On mount, build visable data. On update, if change in target stock, rebuild visable data.
        if (isInitialMount.current === true && widgetCopy === widgetKey) { //on Mount
            isInitialMount.current = false;
        } else {
            if (isInitialMount.current === true) { isInitialMount.current = false }
            const payload: object = {
                key: widgetKey,
                securityList: [[`${targetSecurity}`]]
            }
            dispatch(rBuildVisableData(payload))
        }
    }, [targetSecurity, widgetKey, widgetCopy, dispatch, isInitialMount])
}