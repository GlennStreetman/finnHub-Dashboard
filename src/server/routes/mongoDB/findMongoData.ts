import express from 'express';
import { getDB } from '../../db/mongoLocal.js'

const router = express.Router();

interface session {
    login: boolean,
    uID: number,
}

export interface reqObj { //fetch post/findMongoData
    searchList: string[], //list of widgetKeys to search for.
    dashboard: string, //dashboard name
}

interface findMongoDataPost extends Request {
    session: session,
    body: any
}

//RESPONSE interfaces
interface optionList {
    [key: string]: string
}

interface queryOptions {
    userID: number,
    $or: optionList[],
}

export interface resObj { //returns list of resObjs
    key: string,
    userID: string,
    apiString: string,
    dashboard: string,
    data: Object,
    description: string,
    retrieved: number,
    security: string,
    stale: number,
    widget: string,
    widgetType: string,
}

//receives list of records to retrieve, returns list of response objects.
router.post('/findMongoData', async (req: findMongoDataPost, res: any) => {
    if (req.session.login === true) {
        try {
            const body: reqObj = req.body
            const searchList = body.searchList
            const dashboard = body.dashboard
            const client = getDB()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');
            const findList = [{ key: 'plug' }]
            for (const key in searchList) {

                const thisKey = dashboard + '-' + searchList[key]
                findList.push({
                    key: thisKey
                })
            }
            const options: queryOptions = {
                userID: req.session.uID,
                $or: findList
            }
            const findDataSet = await dataSet.find(options)
            const resList: resObj[] = []
            await findDataSet.forEach((data: resObj) => { //map this
                resList.push(data)
            })

            res.status(200).json(resList) //returns list of objects.

        }
        catch (err) {
            console.log(err)
            res.status(500).json({ message: `Problem running find request on MongoDB.` });
        }
    }
})


export default router

