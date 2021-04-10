import express from 'express';
import { getDB } from '../../db/mongoLocal.js'
// import { finnHubData } from '../../db/mongoTypes'

interface session {
    login: boolean,
    uID: number,
}

interface thisSession extends Request {
    session: session,
    body: any
}

const router = express.Router();

//gets user, none stale, finnhub data. This process deletes stale records.
router.get('/finnDashData', async (req: thisSession, res: any) => {
    if (req.session.login === true) {
        try {
            // console.log("1get FinndashData")
            const client = getDB()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');
            await dataSet.deleteMany({ //delete stale records for user
                userID: req.session.uID,
                stale: { $lte: Date.now() }
            })
            // console.log("2delete complete")
            const findDataSet = dataSet.find({
                userID: req.session.uID,
            })
            const resList: any[] = []
            await findDataSet.forEach((data: any) => {
                resList.push(data)
            })
            // client.close()
            console.log('3Got data', resList)
            res.status(200).json({ resList })

        }
        catch (err) {
            console.log(err)
            res.status(500).json({ message: `Problem finding user dataset.` });
        }
    }
})

//updates MongoDB finnDash.dataset with finnhub data.
router.post("/finnDashData", async (req: thisSession, res: any) => {
    if (req.session.login === true) {
        console.log("UPDATING FINNDASH DATA")
        try {
            const client = getDB()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');

            console.log('1 updating mongodb finnhubdata')
            const updateData = req.body
            for (const record in updateData) {
                const u = updateData[record]

                const filters = {
                    userID: req.session.uID,
                    key: record,
                }
                // const widget = record.slice(0, record.indexOf('-'))
                const update = {
                    $set: {
                        userID: req.session.uID,
                        key: record,
                        widget: u.widget,
                        dashboard: u.dashboard,
                        widgetName: u.widgetName,
                        retrieved: u.updated,
                        stale: u.updated + 1000 * 60 * 60 * 30,
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
                // console.log('2:', update)
                await dataSet.updateOne(filters, update, options)
                    .catch((err) => { console.log('Problem updating dataset', err) })
            }
            // client.close()
            res.status(200).json({ message: `Updates Complete` });
        }
        catch (err) {
            console.log('Problem updating finnHub dataset:', err)
            res.status(500).json({ message: `Problem updating finnHub dataset` })
        }
    }
})

export default router

