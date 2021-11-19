import { useEffect } from "react";
import { tSearchMongoDB, tSearchMongoDBReq } from '../../thunks/thunkSearchMongoDB'
import { tGetFinnhubData } from '../../thunks/thunkFetchFinnhub'
import { finnHubQueue } from "./../../appFunctions/appImport/throttleQueueAPI"
import { rSetUpdateStatus } from "./../../slices/sliceDataModel";

import { tgetFinnHubDataReq } from './../../thunks/thunkFetchFinnhub'
//updates widgets config.targetSecurity for any widget that uses a target security.
export const useSearchMongoDb = function (
    finnHubQueue: finnHubQueue, //queue object
    targetSecurity: string, //p.config.targetSecurity
    widgetKey: string, //p.widgetKey 
    widgetCopy: string, //copy object
    dispatch: Function, //Dispatch()
    isInitialMount, //current = boolean
    dashboardID: number, //id for dashboard, not name.
) {
    useEffect(() => { //on change to targetSecurity rebuild data set.
        if (isInitialMount.current === true && widgetCopy === widgetKey) {
        } else if (targetSecurity && targetSecurity !== '' && isInitialMount.current !== true) {
            const target = `${widgetKey}-${targetSecurity}`
            const tSearchMongoDBObj: tSearchMongoDBReq = { searchList: [target], dashboardID: dashboardID }
            dispatch(tSearchMongoDB(tSearchMongoDBObj))
                .then((res) => {
                    if (Object.values(res.payload)[0] === '') { //if no payload returned get new finnhub data.

                        const payload: tgetFinnHubDataReq = {
                            currentDashboard: res.dashboard,
                            widgetList: [widgetKey],
                            finnHubQueue: finnHubQueue,
                            forceUpdate: true
                        }
                        dispatch(tGetFinnhubData(payload))
                    }
                })
        }
    }, [targetSecurity, widgetKey, dispatch, isInitialMount, widgetCopy, finnHubQueue, dashboardID])
}

//CONDITIONS THAT ONE OF MUST RETURN FALSE