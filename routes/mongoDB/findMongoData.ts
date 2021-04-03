import express from 'express';
import { getDB } from '../../db/mongoLocal.js'

const router = express.Router();

interface optionList {
    [key: string]: string
}

interface options {
    userID: number,
    $or: optionList[],
}

export interface reqObj {
    req: string[],
    dashboard: string
}


router.post('/findMongoData', async (req: any, res: any) => {
    if (req.session.login === true) {
        try {
            const body = req.body.req
            const d = req.body.dashboard
            const client = getDB()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');
            const findList = [{ key: 'plug' }]
            for (const key in body) {
                const thisKey = d + '-' + body[key]
                findList.push({
                    key: thisKey
                })
            }
            const options: options = {
                userID: req.session.uID,
                $or: findList
            }
            // console.log('options--------------', options)
            const findDataSet = await dataSet.find(options)
            // console.log(findDataSet)
            const resList = []
            await findDataSet.forEach((data) => {
                // console.log('---------------sorting data-----------------', data)
                resList.push(data)
            })

            // console.log('3Got data', resList)
            res.status(200).json({ resList }) //returns list of objects.

        }
        catch (err) {
            console.log(err)
            res.status(500).json({ message: `Problem running find request on MongoDB.` });
        }
    }
})


export default router

