import express from 'express';
import format from 'pg-format';
import dbLive from "./../../db/databaseLive.js";
import devDB from "./../../db/databaseLocalPG.js";
const router = express.Router();
const db = process.env.live === "1" ? dbLive : devDB;
//user should only be hitting this endpoint after visiting password reset link sent to their email.
//find and return secret question for specified user WHERE password reset flag has been set to 1.
//flag set to 1 by password reset link in email.
router.get("/findSecret", (req, res, next) => {
    // req.session.userName = req.query['user']
    let userID = format('%L', req.query['user']);
    let verifyUpdate = `
    SELECT secretQuestion
    FROM users
    WHERE loginName = ${userID} AND passwordconfirmed = true
    `;
    // console.log(verifyUpdate)
    db.query(verifyUpdate, (err, rows) => {
        if (err) {
            console.log("ERROR /verifyUpdate: ", err);
            res.status(400).json({ message: "Error during password reset process." });
        }
        else if (rows.rowCount === 1) {
            const secretQuestion = rows.rows[0].secretquestion;
            const data = {
                question: secretQuestion,
                user: userID,
            };
            console.log(`Secret Questions returned for user ${userID}.`);
            res.status(200).json(data);
        }
        else {
            res.status(401).json({ message: 'Problem with reset password link.' });
        }
    });
});
export default router;
//# sourceMappingURL=findSecret.js.map