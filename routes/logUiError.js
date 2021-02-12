const express = require("express");  
const router = express.Router();
const format = require("pg-format"); //USE FOR ALL QUERY STRING parameters. Helps prevent SQL injection.
// const cryptoRandomString = require("crypto-random-string");
const db = process.env.live === "1" ? require("../db/databaseLive.js") : require("../db/databaseLocalPG.js");
// const URL = process.env.live === '1' ? `https://finn-dash.herokuapp.com` : `http://localhost:5000`

// const API_KEY = process.env.API_KEY || 1;
// const DOMAIN = process.env.DOMAIN_KEY || 1;
// const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });

// function emailIsValid(email) {
//   return /\S+@\S+\.\S+/.test(email);
// };

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

module.exports = router;