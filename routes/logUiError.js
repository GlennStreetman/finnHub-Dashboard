import express from "express";  
import format from "pg-format"; //USE FOR ALL QUERY STRING parameters. Helps prevent SQL injection.
import dbLive from "./../db/databaseLive.js"
import devDB from "./../db/databaseLocalPG.js"

const db = process.env.live === "1" ? dbLive : devDB;

const router = express.Router();

router.post("/logUiError", (req, res) => {
    const widget = format("%L", req.body.widget);
    const errorMessage = format("%L", JSON.stringify(req.body.errorMessage));

    const uiErrorUpdate = `
        INSERT INTO uierror 
        (widget, errormessage, lastoccured, errorcount) 
        VALUES (${widget}, ${errorMessage}, CURRENT_TIMESTAMP, 1)
        ON CONFLICT (widget, errormessage)
        DO UPDATE
        SET lastoccured = CURRENT_TIMESTAMP, errorcount = (
            SELECT errorcount 
            FROM uierror 
            WHERE widget = ${widget} AND errormessage = ${errorMessage}) + 1
        `;
    // console.log(uiErrorUpdate)
    db.query(uiErrorUpdate, (err) => {
        if (err) {
            console.log('Error loggin uiError:', widget)
            res.json(false);
        } else {
            res.json(true);
        }
        
    })
})

export default router