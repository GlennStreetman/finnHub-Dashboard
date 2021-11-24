import { useEffect } from "react";
import { rBuildVisableData } from '../../slices/sliceShowData'
//updates widgets config.targetSecurity for any widget that uses a target security.
export const useBuildVisableData = function (
    targetSecurityList, //list of securites that need to be available in slice.visableData.
    widgetKey, //p.widgetKey
    widgetCopy, // widgetCopy from drag function OR widgetKey 
    dispatch, // Dispatch()
    isInitialMount, //const isInitialMount
) {
    useEffect(() => {//On mount, build visable data. On update, if change in target stock, rebuild visable data.
        if (isInitialMount.current === true && widgetCopy === widgetKey) { //on Mount, do not rebuild if widget copy.
            isInitialMount.current = false;
        } else {
            console.log('building visable data', widgetKey)
            if (isInitialMount.current === true) { isInitialMount.current = false }
            const payload: object = {
                key: widgetKey,
                securityList: targetSecurityList
            }
            dispatch(rBuildVisableData(payload))
        }
    }, [targetSecurityList, widgetKey, widgetCopy, dispatch, isInitialMount])
}