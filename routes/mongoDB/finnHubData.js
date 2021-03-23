import express from 'express';
import {getDB} from '../../db/mongoLocal.js'


const router =  express.Router();

//gets user, none statle, finnhub dtata. This process deletes stale records.
router.get('/finnDashData', async (req, res) => {
    if (req.session.login === true) {
        try {
            // console.log("1get FinndashData")
            const client = getDB()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');
            await dataSet.deleteMany({ //delete stale records for user
                userID: req.session.uID,
                stale: {$lte: Date.now()}
            })
            // console.log("2delete complete")
            const findDataSet = dataSet.find({
                userID: req.session.uID,
            })
            const resList = []
            await findDataSet.forEach((data)=>{
                resList.push(data)
            })
            // client.close()
            // console.log('3Got data', resList)
            res.status(200).json({resList})

        }
        catch(err){
            console.log(err)
            res.status(500).json({message: `Problem finding user dataset.`});
        }       
    }
})

//updates MongoDB finnDash.dataset with finnhub data. Single record.
router.post("/finnDashData", async (req, res) => {
    if (req.session.login === true) { 
        try {
            const client = getDB()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');

            // console.log('1 updating mongodb finnhubdata')
            const updateData = req.body
            for (const record in updateData) {
                const u = updateData[record]
                const filters = {
                    userID: req.session.uID,
                    key: record,
                }
                const update = {
                    $set:{
                        userID: req.session.uID,
                        key: record,
                        dataSetName: 'default',
                        retrieved: u.updated,
                        stale: u.updated + 1000 * 60 * 60 * 30,
                        data: u.data
                    }
                }
                const options = {
                    upsert: true
                }
                // console.log('2:', update)
                await dataSet.updateOne(filters, update, options) 
                .catch((err)=>{console.log('Problem updating dataset', err)})           
            }
            // client.close()
            res.status(200).json({message: `Updates Complete`});
        }
        catch(err){
            console.log('Problem updating finnHub dataset:', err)
            res.status(500).json({message: `Problem updating finnHub dataset`})
        }
    }
})

export default router

