const express = require("express");  
const router = express.Router();
const format = require("pg-format");
const cryptoRandomString = require("crypto-random-string");
const db = process.env.live === "1" ? require("../../db/databaseLive.js") : require("../../db/databaseLocalPG.js");
const URL = process.env.live === '1' ? `https://finn-dash.herokuapp.com` : `http://localhost:5000`

const API_KEY = process.env.API_KEY || 1;
const DOMAIN = process.env.DOMAIN_KEY || 1;
const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });

function emailIsValid(email) {
  return /\S+@\S+\.\S+/.test(email);
};


router.get("/accountData", (req, res) => {
  // thisRequest = req.query;
  if (req.session.login === true) {
    let accountDataQuery = `SELECT loginName, email, apiKey, webHook, ratelimit FROM users WHERE id =$1`;
    let queryValues = [req.session.uID];
    let resultSet = {};
    db.query(accountDataQuery, queryValues, (err, rows) => {
      let result = rows.rows[0];
      // console.log(result)
      if (err) {
        res.json({message: "Could not retrieve user data"});
      } else {
        resultSet["userData"] = result;
        // console.log(resultSet)
        console.log("account data retrieved");
        res.json(resultSet);
      }
    });
  } else {res.json({message: "Not logged in."})}
});

router.post("/accountData", (req, res) => {
  // console.log(req.body);
  if (req.session.login === true) {  
    
    if (req.body.field !== "email") {
    //NOT EMAIL
      console.log("updating account data");
    let updateField = req.body.field;
    let newValue = req.body.newValue;
    // console.log(updateField, newValue)
    let updateQuery = format("UPDATE users SET %I = %L WHERE id=%L", updateField, newValue, req.session.uID);
    // console.log(updateQuery);
    // let queryValues = [updateField, newValue, req.session.uID]
    db.query(updateQuery, (err) => {
      if (err) {
        res.json({message: `Failed to update ${updateField}`});
      } else {
        res.json({
          message: `${updateField} updated`,
          data: newValue,
      });
      }
    });
    } else {
    //EMAIL
    if (emailIsValid(req.body.newValue) === true) {
      console.log("new email address");

      let newValue = format(req.body.newValue);
      let queryString = cryptoRandomString({ length: 32 });
      let updateQuery = `INSERT INTO newEmail (userId, newEmail, queryString)
        VALUES (${req.session.uID}, '${newValue}', '${queryString}')
        `;
      
      // console.log(updateQuery);
      db.query(updateQuery, (err) => {
        if (err) {
          // console.log(err)
          res.json({message: `Problem updating email.`});
        } else {
          // console.log(res);
          const data = {
            from: "Glenn Streetman <glennstreetman@gmail.com>",
            to: newValue,
            subject: "DO NOT REPLY: Verify Finnhub email change",
            text: `Please visit the following link to verify the change to your finnhub email address: ${URL}/verifyChange?id=${queryString}`,
          };
          //send email
          mailgun.messages().send(data, (error) => {
            if (error) {
              console.log(error);
              res.json({message: "Failed to send verification email"});
            } else {
              res.json({message: "Please check email to verify change."});
            }
          });
        }
      });
    } else {res.json({message: `email not valid`})}}
  } else {res.json({message: "Not logged in."})}
});

module.exports = router;