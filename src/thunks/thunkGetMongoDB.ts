import { createAsyncThunk } from '@reduxjs/toolkit';

//deletes stale data from mongo db
//retrieves fresh mongo data.
//returns fresh mongo data to update sliceShowData & slicefinnHubData
export interface mongoObj {
    updated: string,
    stale: number,
    data: Object,
    key: string,
    dashboard: string,
    widget: string,
    security: string,
    widgetType: string
}

export interface getMongoRes {
    [key: string]: mongoObj
}

interface tgetMongoDBReq {
    widget?: string,
    dashboard?: number | string
}

export const tGetMongoDB = createAsyncThunk( //{endPoint, [securityList]}
    'tgetMongoDb',
    async (reqObj: tgetMongoDBReq | false = false) => {
        try {
            let fetchString = '/getFinnDashDataMongo'
            if (reqObj) { //build request string with filters.
                fetchString = fetchString + '?'
                if (reqObj.dashboard) fetchString = `${fetchString}dashboardID=${reqObj.dashboard}`
                if (reqObj.widget) fetchString = `${fetchString}&widget=${reqObj.widget}`
            }
            return new Promise((async (resolve: any) => {
                const getData = await fetch(fetchString)
                const freshData = await getData.json()

                const resObj: getMongoRes = {}
                for (const x in freshData.resList) {
                    const mongo = freshData.resList[x]
                    resObj[mongo.key] = {
                        updated: mongo.retrieved,
                        stale: mongo.stale,
                        data: mongo.data,
                        key: mongo.key,
                        dashboard: mongo.dashboard,
                        widget: mongo.widget,
                        security: mongo.security,
                        widgetType: mongo.widgetType
                    }
                }
                console.log('tGetMongoDB', reqObj, '---', freshData, '--s--', resObj)
                resolve(resObj)
            }))

        } catch (err) {
            console.log('tgetMongoDb: Error retrieving mongoDB', err)
        }
    })


