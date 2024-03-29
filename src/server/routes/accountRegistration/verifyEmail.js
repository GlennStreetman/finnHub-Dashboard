import express from "express";
import format from "pg-format";
import postgresDB from "./../../db/databaseLocalPG.js";

const router = express.Router();
//verifys emails address. Part of registration process
router.get("/api/verifyEmail", (req, res, next) => {
    const db = postgresDB;
    let verifyID = format("%L", req.query["id"]);
    let verifyUpdate = `
    UPDATE users
    SET emailconfirmed = true, confirmemaillink = ''
    WHERE confirmemaillink = ${verifyID}
    `;
    // console.log(verifyUpdate)
    db.query(verifyUpdate, (err, rows) => {
        // console.log(rows)
        if (err) {
            console.log("ERROR verifyEMail: ", err);
            res.status(302).redirect("/?message=2");
        } else if (rows.rowCount === 1) {
            // console.log('email verified')
            res.status(302).redirect("/?message=1");
        } else {
            res.status(302).redirect("/?message=2");
        }
    });
});

export default router;
