import express from 'express';
import { getDB } from '../../db/mongoLocal.js'
// import { finnHubData } from '../../db/mongoTypes'
const router = express.Router();

export interface reqBody {
    widget: number,
    filters: Object,
}

interface session {
    login: boolean,
    uID: number,
}

interface thisSession extends Request {
    session: session,
    body: any
}

//updates filters for matching userID and widetID
//{widget: int, filters: {}}
router.post("/updateGQLFilters", async (req: thisSession, res: any) => {
    if (req.session.login === true) {
        console.log("setting MongoDB widget filters.")
        try {
            const client = getDB()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');

            console.log('1 updating mongodb filters')
            const updateData: reqBody = req.body

            const query = {
                userID: req.session.uID,
                widget: updateData.widget,
            }

            const update = {
                $set: {
                    config: updateData.filters
                }
            }
            await dataSet.updateMany(query, update)
                .catch((err) => { console.log('Problem updating mongo filters.', err) })
            res.status(200).json({ message: `Update filters Complete` });
        }
        catch (err) {
            console.log('Problem updating finnHub dataset:', err)
            res.status(500).json({ message: `Problem updating mongo filters.` })
        }
    } else { console.log('USER NOT LOGGED IN') }
})

export default router

// db.dataSet.updateMany({ userID: 674, widget: '1618080161480' }, { '$set': { config: { metricSource: 'US-TSLA', metricSelection: { test: "test" } } } })