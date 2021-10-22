import express from 'express';
import format from 'pg-format';
import postgresDB from "./../../db/databaseLocalPG.js"
import md5 from 'md5';

const router =  express.Router();


//redirect to /newPW from /reset route.
//username and resesion reset flag should be set by redirect.
router.get("/newPW", (req, res, next) => {
    const db = postgresDB;
    // console.log("/newPW:", req.session)
    const newPW = format('%L', req.query.newPassword)
    const userName = format('%L', req.session.userName)
    const reset = format('%L', req.session.reset)
    // console.log(newPW, userName, reset)
    const newQuery = `
    UPDATE users 
    SET password = '${md5(newPW)}', passwordconfirmed = false, resetpasswordlink = '' 
    WHERE loginName = ${userName} 
        AND 1 = ${reset} 
        AND resetpasswordlink = 'testpasswordlink' 
        AND passwordconfirmed = true` ;
    // console.log(newQuery);
    db.query(newQuery, (err, rows) => {
    if (err) {
        console.log("ERROR /newPW: ", err)
        res.status(400).json({message: "Could not reset password"});
    } else if (rows.rowCount === 1) {
        // console.log("password reset");
        res.status(200).json({message: "true"});
    } else {

        res.status(401).json({message: "Password not updated, restart process."});
    }
    });
});

export default router