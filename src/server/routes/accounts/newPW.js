import express from "express";
import format from "pg-format";
import postgresDB from "./../../db/databaseLocalPG.js";
import sha512 from "./../../db/sha512.js";

const router = express.Router();

const passwordIsValid = function (password) {
    //Minimum eight characters, at least one letter, one number and one special character:
    console.log("testing pw", password);
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
        password
    );
};

router.post("/api/newPW", (req, res, next) => {
    try {
        if (req.session === undefined)
            throw new Error("Request not associated with session.");
        if (req.session.login === true) {
            if (passwordIsValid(req.body.newPassword)) {
                const db = postgresDB;
                const newPW = format("%L", req.body.newPassword);
                const id = format("%L", req.session.uID);
                console.log("new pw request", newPW, id);
                const newQuery = `
    UPDATE users 
    SET password = '${sha512(newPW)}'
    WHERE id = ${id}`;
                db.query(newQuery, (err, rows) => {
                    if (err) {
                        res.status(400).json({
                            message: "Password not updated, contact support.",
                        });
                    } else if (rows.rowCount === 1) {
                        res.status(200).json({ message: "Password Updated" });
                    } else {
                        console.log();
                        res.status(401).json({
                            message: "Password not updated, contact support.",
                        });
                    }
                });
            } else {
                res.status(401).json({
                    message:
                        "Password must be >7 characters, 1 upper, 1 special.",
                });
            }
        } else {
            console.log("not logged in");
            res.status(401).json({ message: "Not logged in." });
        }
    } catch (error) {
        next(error);
    }
});

export default router;
