import express from "express";
import format from "pg-format";
import postgresDB from "../../db/databaseLocalPG.js";

const router = express.Router();

//returns temporary login link via email.
router.get("/reset", (req, res, next) => {
    console.log("--reset link ---");
    const db = postgresDB;
    console.log(req.query);
    let verifyID = format("%L", req.query["id"]);
    console.log("verifyID", verifyID);
    req.session.email = req.query["email"];
    let verifyUpdate = `
    UPDATE users
    SET templogin = ${Date.now()}
    WHERE resetpasswordlink = ${verifyID} AND email = '${req.query["email"]}'
    RETURNING *
    `;
    db.query(verifyUpdate, (err, rows) => {
        if (err) {
            console.log("ERROR reseting pw: ", verifyUpdate, err);
            res.status(400).json({ message: "Error during password reset process." });
        } else if (rows.rowCount === 1) {
            console.log("password reset", verifyUpdate);
            res.status(302).redirect(`/?reset=${verifyID}`);
        } else {
            console.log("problem reseting", rows.rowcount, verifyUpdate);
            res.status(302).redirect(`/?message=Problem%validating%reset%link,%please%restart%process.`);
        }
    });
});

export default router;
