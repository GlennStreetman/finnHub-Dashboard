import express from 'express';
import format from 'pg-format';
import postgresDB from "../../db/databaseLocalPG.js"

const router =  express.Router();


//user visits reset link, from their email, and get redirected to reset password screen in app.
router.get("/reset", (req, res, next) => {
    const db = postgresDB
    // console.log(req.query)
    let verifyID = format('%L', req.query['id'])
    req.session.userName = req.query['users']
    let verifyUpdate = `
    UPDATE users
    SET passwordconfirmed = true
    WHERE resetpasswordlink = ${verifyID} AND loginname = '${req.query['users']}'
    RETURNING *
    `
    // console.log(verifyUpdate)
    db.query(verifyUpdate, (err, rows) => {
    if (err) {
        console.log('ERROR reseting pw: ',verifyUpdate,  err)
        res.status(400).json({message: "Error during password reset process."});
    } else if (rows.rowCount === 1) {
        console.log('password reset', verifyUpdate)
        res.status(302).redirect(`/?reset=1&users=${rows.rows[0].loginname}`)
    } else {
        console.log('problem reseting', rows.rowcount, verifyUpdate)
        res.status(302).redirect(`/?message=Problem%validating%reset%link,%please%restart%process.`)
    }
    })
});

export default router