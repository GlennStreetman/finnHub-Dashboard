const express = require("express");  
const router = express.Router();
const format = require("pg-format"); //USE FOR ALL QUERY STRING parameters. Helps prevent SQL injection.
// const cryptoRandomString = require("crypto-random-string");
const db = process.env.live === "1" ? require("../../db/databaseLive.js") : require("../../db/databaseLocalPG.js");
// const URL = process.env.live === '1' ? `https://finn-dash.herokuapp.com` : `http://localhost:5000`

// const API_KEY = process.env.API_KEY || 1;
// const DOMAIN = process.env.DOMAIN_KEY || 1;
// const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });

// function emailIsValid(email) {
//   return /\S+@\S+\.\S+/.test(email);
// };

router.get("/newRoute", (req, res) => {
    if (req.session.login === true) {
        const queryParam = format("%L", req.query["PLACEHOLDER"]);
        let NEWQUERY = `SELECT FROM  WHERE id =$1 AND PLACEHOLDER = ${queryParam}`;
        let queryValues = [req.session.uID];
        db.query(NEWQUERY, queryValues, (err, rows) => {
            //DO SOMETHING!
        })
    } else {res.json({message: "Not logged in."})}
})
module.exports = router;