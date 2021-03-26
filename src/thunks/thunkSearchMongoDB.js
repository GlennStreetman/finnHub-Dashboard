import { createAsyncThunk } from '@reduxjs/toolkit';
//receives list of strings to search for.
//pushes returned string to visableData in redux.
export const tSearchMongoDB = createAsyncThunk( //{endPoint, [securityList]}
    'tSearch',
    async (req) => { //l{ist of securities}
    //if stale pop from list 
    try {
        // const ap = req.payload
        console.log("Get Mongo Data")
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
            };
        console.log("Searching mongoDB with: ", req)
        const getData = await fetch('/findMongoData', options)
        const foundData = await getData.json()
        console.log('foundData', foundData)
        const resObj = {}
        for (const x in foundData.resList){
            const mongo = foundData.resList[x]
            resObj[mongo.key] = {
                updated: mongo.retrieved,
                stale: mongo.stale,
                data: mongo.data,
                key: mongo.key,
            }
        }
        return(resObj)

    }catch(err){
        console.log('Error retrieving mongoDB', err)
        return('Problem retrieving mongo data')
    }
    })
        