import express from "express";
import format from "pg-format";
import postgresDB from "./../../db/databaseLocalPG.js";
const router = express.Router();

router.get("/api/accountData", (req, res, next) => {
    try {
        console.log("getting account data");
        if (req.session === undefined) throw new Error("Request not associated with session.");
        const db = postgresDB;
        if (req.session.login === true) {
            const accountDataQuery = `
        SELECT email, apiKey, webHook, ratelimit, apialias, widgetsetup 
        FROM users 
        WHERE id =$1`;
            const queryValues = [req.session.uID];
            const resultSet = {};
            // console.log(accountDataQuery);
            db.query(accountDataQuery, queryValues, (err, rows) => {
                const result = rows.rows[0];
                // console.log(result)
                if (err) {
                    console.log("/accountData ERROR:", err);
                    res.status(400).json({
                        message: "Could not retrieve user data",
                    });
                } else {
                    resultSet["userData"] = result;
                    console.log("returning account data", resultSet);
                    res.status(200).json(resultSet);
                }
            });
        } else {
            res.status(401).json({ message: "Not logged in." });
        }
    } catch (error) {
        console.log("error getting account data");
        next(error);
    }
});

router.post("/api/accountData", (req, res) => {
    const db = postgresDB;
    // console.log("---------------", req.body);

    const field = format(req.body.field);
    const newValue = format(req.body.newValue);

    console.log("field", field, "newValue", newValue);

    if (req.session.login === true) {
        if (
            field !== "email" &&
            ["loginname", "ratelimit", "webhook", "apikey", "exchangelist", "email", "apialias", "widgetsetup"].includes(field)
        ) {
            console.log("updating account data");
            const updateQuery = format("UPDATE users SET %I = %L WHERE id=%L", field, newValue, req.session.uID);
            console.log("updateQuery", updateQuery);
            // let queryValues = [updateField, newValue, req.session.uID]
            db.query(updateQuery, (err) => {
                if (err) {
                    console.log("/accountData update query error: ", err);
                    res.status(400).json({
                        message: `Failed to update ${field}`,
                    });
                } else {
                    res.status(200).json({
                        message: `${field} updated`,
                        data: newValue,
                    });
                }
            });
        } else {
            res.status(401).json({
                message: `Error processing request Field: ${req.body.field}`,
            });
        }
    } else {
        res.json({ message: "Not logged in." });
    }
});

export default router;
