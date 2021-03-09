const express = require('express');
const router =  express.Router();
const client = process.env.live === '1' ? 
    require("../../db/mongoLocal.js") :  
    require("../../db/mongoLocal.js") ;

router.post("/mongoUpdate", async (req, res) => {
    if (req.session.login === true) { 
        try {
            await client.connect()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');

            console.log('1 updating mongodb finnhubdata')
            const updateData = req.body
            for (const update in updateData) {
                const u = updateData[update]
                const filters = {
                    user: req.session.uID,
                    key: update
                }
                const dat = {
                        userID: req.session.uID,
                        key: update,
                        dataSetName: 'default',
                        retrieved: u.updated,
                        stale: u.updated + 1000 * 60 * 60 * 30,
                        value: u.data
                }
                const options = {
                    upsert: true
                }
                console.log(dataSet)
                dataSet.insertOne({dat})
                .catch((err)=>{console.log(err)})
                console.log('3')
                
            }
            client.close()
        }
        catch(err){console.log(err)}
        res.status(200).json({message: `Updates Complete`});
    }
})

module.exports = router;