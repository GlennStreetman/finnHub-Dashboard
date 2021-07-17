import { useEffect } from "react";
import { tSearchMongoDB } from '../../thunks/thunkSearchMongoDB'
import { tGetFinnhubData } from '../../thunks/thunkFetchFinnhub'
import { finnHubQueue } from "./../../appFunctions/appImport/throttleQueueAPI"
import { rSetUpdateStatus } from "./../../slices/sliceDataModel";
//updates widgets config.targetSecurity for any widget that uses a target security.
export const useSearchMongoDb = function (
    currentDashBoard: string,
    finnHubQueue: finnHubQueue,
    targetSecurity: string, //p.config.targetSecurity
    widgetKey: string, //p.widgetKey 
    widgetCopy: string,
    dispatch: Function, //Dispatch()
    isInitialMount,
) {
    useEffect(() => { //on change to targetSecurity rebuild data set.
        if (isInitialMount.current === true && widgetCopy === widgetKey) {
        } else if (targetSecurity && targetSecurity !== '' && isInitialMount.current !== true) {
            const target = `${widgetKey}-${targetSecurity}`
            dispatch(tSearchMongoDB([target]))
                .then((res) => {
                    if (Object.values(res.payload)[0] === '') {
                        const payload = {
                            targetDashBoard: currentDashBoard,
                            widgetList: [widgetKey],
                            finnHubQueue: finnHubQueue,
                            rSetUpdateStatus: rSetUpdateStatus,
                        }
                        dispatch(tGetFinnhubData(payload))
                    }
                })
        }
    }, [targetSecurity, widgetKey, dispatch, isInitialMount, widgetCopy, currentDashBoard, finnHubQueue])
}

//CONDITIONS THAT ONE OF MUST RETURN FALSE