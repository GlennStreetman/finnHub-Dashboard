import express from 'express';
import { getDB } from '../../db/mongoLocal.js'

const router = express.Router();

interface deleteBody {
    oldName: string,
    newName: string,
}

interface session {
    login: boolean,
    uID: number,
}

interface deleteRequest extends Request {
    session: session,
    body: any
}

router.post('/renameDashboardMongo', async (req: deleteRequest, res: any) => {
    if (req.session.login === true) {
        try {
            const client = getDB()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');

            console.log('1 updating mongodb filters')
            const updateData: deleteBody = req.body

            const query = {
                userID: req.session.uID,
                dashboard: updateData.oldName,
            }

            const update = {
                $set: {
                    dashboard: updateData.newName
                }
            }

            await dataSet.updateMany(query, update)
                .catch((err) => { console.log('Problem updating mongo filters.', err) })
            console.log('RECORDS UPDATED')
            res.status(200).json({ message: `Update dashboard name complete Complete` });
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ message: `Problem updating dashboard name in mongo.` });
        }
    }
})

export default router

