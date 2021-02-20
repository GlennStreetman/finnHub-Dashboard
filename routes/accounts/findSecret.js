const express = require('express');
const router =  express.Router();
const format = require('pg-format');
const db = process.env.live === '1' ? 
    require("../../db/databaseLive.js") :  
    require("../../db/databaseLocalPG.js") ;

//user should only be hitting this endpoint after visiting password reset link sent to their email.
//find and return secret question for specified user WHERE password reset flag has been set to 1.
//flag set to 1 by password reset link in email.
router.get("/findSecret", (req, res, next) => {
    // req.session.userName = req.query['user']
    let userID = format('%L', req.query['user'])
    let verifyUpdate = `
    SELECT secretQuestion
    FROM users
    WHERE loginName = ${userID} AND passwordconfirmed = true
    `
    // console.log(verifyUpdate)
    db.query(verifyUpdate, (err, rows) => {
        if (err) {
            res.statusCode = 401
            res.json({message: "Error during password reset process."});
        } else if (rows.rowCount === 1) {
            const secretQuestion = rows.rows[0].secretquestion
            const data = {
                question: secretQuestion,
                user: req.query['user'],
            }
            console.log(`Secret Questions returned for user ${userID}.`)
            res.statusCode = 200
            res.json(data)
        } else {
            res.statusCode = 406
            res.json({message: 'Problem with reset password link.'})
        }
    })
});

module.exports = router;