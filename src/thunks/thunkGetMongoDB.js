import { createAsyncThunk } from '@reduxjs/toolkit';
//deletes stale data from mongo db
//retrieves fresh mongo data.
//returns fresh mongo data to update sliceShowData & slicefinnHubData
export const tGetMongoDB = createAsyncThunk( //{endPoint, [securityList]}
    'tgetMongoDb',
    async (req) => { //l{ist of securities} 
    try {
        console.log("Getting cached finnhub data")
        const getData = await fetch('/finnDashData')
        const freshData = await getData.json()
        const resObj = {}
        for (const x in freshData.resList){
            const mongo = freshData.resList[x]
            resObj[mongo.key] = {
                updated: mongo.retrieved,
                stale: mongo.stale,
                data: mongo.data,
                key: mongo.key,
                dashboard: mongo.dashboard,
                widget: mongo.widget,
                security: mongo.security
            }
        }
        // console.log('UPDATE FROM MONGO COMPLETE', resObj)
        return(resObj)

    }catch(err){
        console.log('Error retrieving mongoDB', err)
        return('Problem retrieving mongo data')
    }
    })
        