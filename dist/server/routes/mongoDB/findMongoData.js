import express from 'express';
import { getDB } from '../../db/mongoLocal.js';
const router = express.Router();
//receives list of records to retrieve, returns list of response objects.
router.post('/findMongoData', async (req, res) => {
    if (req.session.login === true) {
        try {
            const body = req.body;
            const searchList = body.searchList;
            const dashboard = body.dashboard;
            const client = getDB();
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');
            const findList = [{ key: 'plug' }];
            for (const key in searchList) {
                const thisKey = dashboard + '-' + searchList[key];
                findList.push({
                    key: thisKey
                });
            }
            const options = {
                userID: req.session.uID,
                $or: findList
            };
            const findDataSet = await dataSet.find(options);
            // console.log(findDataSet)
            const resList = [];
            await findDataSet.forEach((data) => {
                resList.push(data);
            });
            console.log('3Got data', resList);
            res.status(200).json(resList); //returns list of objects.
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: `Problem running find request on MongoDB.` });
        }
    }
});
export default router;
//# sourceMappingURL=findMongoData.js.map