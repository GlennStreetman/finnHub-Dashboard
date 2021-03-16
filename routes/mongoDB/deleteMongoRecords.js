const express = require('express');
const router =  express.Router();
const client = process.env.live === '1' ? 
    require("../../db/mongoLocal.js") :  
    require("../../db/mongoLocal.js") ;

//Recieves widget key as a paramater. Deletes corresponding records. req.query['user']
router.get('/deleteFinnDashData', async (req, res) => {
    if (req.session.login === true) {
        console.log("-----running delete!-------")
        try {
            await client.connect()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');
            const widgetSearch = RegExp(`^${req.query['widgetID']}`, 'i')
            const deleteList = await dataSet.deleteMany({ //delete stale records for user
                userID: req.session.uID,
                key: {$regex: widgetSearch},
            })
            console.log('deleteList.deletedCount: ', req.session.uID, widgetSearch, deleteList.deletedCount)
            console.log("-----delete complete-----")
            res.status(200).json({message: 'Records deleted.'})

        }
        catch(err){
            console.log(err)
            res.status(500).json({message: `Problem finding user dataset.`});
        }       
    }
})

module.exports = router;

