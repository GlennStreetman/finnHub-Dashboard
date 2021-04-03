import express from 'express';
import format from 'pg-format';
import dbLive from "./../../db/databaseLive.js";
import devDB from "./../../db/databaseLocalPG.js";
const router = express.Router();
const db = process.env.live === "1" ? dbLive : devDB;
//verifys a change to email address.
router.get("/verifyChange", (req, res, next) => {
    let verifyID = format('%L', req.query['id']);
    let verifyUpdate = `
    UPDATE users
    SET email = (SELECT newemail FROM newEmail WHERE queryString = ${verifyID} limit 1) 
    , emailconfirmed = true, confirmemaillink = ''
    WHERE id = (SELECT userID FROM newEmail WHERE queryString = ${verifyID} limit 1)
    ;
    DELETE FROM newEmail 
    WHERE userID IN (SELECT userID FROM newEmail WHERE queryString = ${verifyID})
    ;
    `;
    // console.log(verifyUpdate)
    db.query(verifyUpdate, (err, rows) => {
        if (err) {
            console.log("FAILED verifyChange: ", err);
            res.status(400).json({ message: "Could not update email address." });
        }
        else if (rows[0].rowCount === 1) {
            res.status(302).redirect('/');
        }
        else {
            res.status(401).json({ message: "Failed to verify new email address." });
        }
    });
});
export default router;
//# sourceMappingURL=verifyChange.js.map