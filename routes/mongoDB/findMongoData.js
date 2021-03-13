const express = require('express');
const router =  express.Router();
const client = process.env.live === '1' ? 
    require("../../db/mongoLocal.js") :  
    require("../../db/mongoLocal.js") ;

//receives list of data to find [...data]
router.post('/findMongoData', async (req, res) => {
    if (req.session.login === true) {
        try {
            const body = req.body
            await client.connect()
            const database = client.db('finnDash');
            const dataSet = database.collection('dataSet');
            const findList = []
            for (const key in body){
                findList.push({
                    key: body[key]
                })
            }
            const options = {
                userID: req.session.uID,
                $or: findList
            }
            console.log('options--------------', options)
            const findDataSet = dataSet.find(options)
            const resList = []
            await findDataSet.forEach((data)=>{
                console.log('sorting data', data)
                resList.push(data)
            })

            console.log('3Got data', resList)
            res.status(200).json({resList}) //returns list of objects.

        }
        catch(err){
            console.log(err)
            res.status(500).json({message: `Problem running find request on MongoDB.`});
        }     
    }
})


module.exports = router;

