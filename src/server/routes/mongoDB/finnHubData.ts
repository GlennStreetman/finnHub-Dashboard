import express from 'express';
import { getDB } from '../../db/mongoLocal.js'
// import { finnHubData } from '../../db/mongoTypes'

interface session {
    login: boolean,
    uID: number,
}



interface finnDashDataReq extends Request {
    session: session,
    body: any
    query: any
}

const router = express.Router();

//gets user, none stale, finnhub data. This process deletes stale records.
router.get('/getFinnDashDataMongo', async (req: finnDashDataReq, res: any) => {
    try {
        const client = getDB()
        const database = client.db('finnDash');
        const dataSet = database.collection('dataSet');
        await dataSet.deleteMany({ //delete stale records for user
            userID: req.session.uID,
            stale: { $lte: Date.now() } //delete records where stale date is saved as less than or equal to now.
        })

        const reqFilter = {
            userID: req.session.uID,
        }
        if (req.query['dashboard']) reqFilter['dashboard'] = req.query['widget']
        if (req.query['widget']) reqFilter['widget'] = req.query['widget']

        const findDataSet = dataSet.find(reqFilter)
        const resList: any[] = []
        await findDataSet.forEach((data: any) => {
            resList.push(data)
        })
        res.status(200).json({ resList })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: `Problem finding user dataset.` });
    }
})



router.post("/postFinnDashDataMongo", async (req: finnDashDataReq, res: any) => {//updates MongoDB finnDash.dataset with finnhub data.
    if (req.session.login === true) {
        try {
            const client = getDB()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');

            const updateData = req.body
            for (const record in updateData) {
                const u = updateData[record]

                const filters = {
                    userID: req.session.uID,
                    key: record,
                }
                const update = {
                    $set: {
                        userID: req.session.uID,
                        key: record,
                        widget: u.widget,
                        dashboard: u.dashboard,
                        widgetName: u.widgetName,
                        retrieved: u.updated,
                        stale: u.updated + 1000 * 60 * 60 * 3, //stale after 3 hours, consider setting up user defined variable.
                        data: u.data,
                        apiString: u.apiString,
                        security: u.security,
                        widgetType: u.widgetType,
                        config: u.config
                    }
                }
                const options = {
                    upsert: true
                }
                await dataSet.updateOne(filters, update, options)
                    .catch((err) => { console.log('Problem updating dataset', err) })
            }
            res.status(200).json({ message: `Updates Complete` });
        }
        catch (err) {
            console.log('Problem updating finnHub dataset:', err)
            res.status(500).json({ message: `Problem updating finnHub dataset` })
        }
    }
})

export default router

