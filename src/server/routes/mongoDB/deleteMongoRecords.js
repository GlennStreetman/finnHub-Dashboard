import express from 'express';
import {getDB} from '../../db/mongoLocal.js'

const router =  express.Router();

//Recieves widget key as a paramater. Deletes corresponding records. req.query['user']
router.get('/deleteFinnDashData', async (req, res) => {
    if (req.session.login === true) {
        // console.log("-----running delete!-------")
        try {
            const client = getDB()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');
            const widgetSearch = RegExp(`^${req.query['widgetID']}`, 'i')
            const deleteList = await dataSet.deleteMany({ //delete stale records for user
                userID: req.session.uID,
                key: {$regex: widgetSearch},
            })
            console.log('deleteList.deletedCount: ', req.session.uID, widgetSearch, deleteList.deletedCount)
            // console.log("-----delete complete-----")
            res.status(200).json({message: 'Records deleted.'})

        }
        catch(err){
            console.log(err)
            res.status(500).json({message: `Problem finding user dataset.`});
        }       
    }
})

export default router

