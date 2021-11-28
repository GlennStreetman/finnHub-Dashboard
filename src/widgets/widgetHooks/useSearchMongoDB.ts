import { useEffect } from "react";
import { tSearchMongoDB, tSearchMongoDBReq } from '../../thunks/thunkSearchMongoDB'
import { tGetFinnhubData } from '../../thunks/thunkFetchFinnhub'
import { finnHubQueue } from "./../../appFunctions/appImport/throttleQueueAPI"
import { rSetUpdateStatus } from "./../../slices/sliceDataModel";

import { tgetFinnHubDataReq } from './../../thunks/thunkFetchFinnhub'
import { widget } from "src/slices/sliceDashboardData";
//updates widgets config.targetSecurity for any widget that uses a target security.
export const useSearchMongoDb = function (
    currentDashBoard: string, //string name of current dashboard, not id.
    finnHubQueue: finnHubQueue, //queue object
    targetSecurity: string, //p.config.targetSecurity
    widgetKey: string | number, //p.widgetKey 
    widgetCopy: number, //copy object
    dispatch: Function, //Dispatch()
    isInitialMount, //current = boolean
    dashboardID: number, //id for dashboard, not name.
) {
    useEffect(() => { //on change to targetSecurity rebuild data set.
        if (targetSecurity && targetSecurity !== '' && isInitialMount.current !== true) {
            const target = `${widgetKey}-${targetSecurity}`
            const tSearchMongoDBObj: tSearchMongoDBReq = { searchList: [target], dashboardID: dashboardID }
            dispatch(tSearchMongoDB(tSearchMongoDBObj))
                .then((res) => {
                    if (Object.values(res.payload)[0] === '') { //if no payload returned get new finnhub data.

                        const payload: tgetFinnHubDataReq = {
                            dashboardID: dashboardID,
                            targetDashBoard: currentDashBoard,
                            widgetList: [widgetKey],
                            finnHubQueue: finnHubQueue,
                            rSetUpdateStatus: rSetUpdateStatus,
                            forceUpdate: true
                        }
                        dispatch(tGetFinnhubData(payload))
                    }
                })
        }
    }, [targetSecurity, widgetKey, dispatch, isInitialMount, widgetCopy, currentDashBoard, finnHubQueue, dashboardID])
}

//CONDITIONS THAT ONE OF MUST RETURN FALSE