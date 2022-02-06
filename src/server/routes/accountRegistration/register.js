import express from "express";
import format from "pg-format";
import cryptoRandomString from "crypto-random-string";
import sha512 from "./../../db/sha512.js";
import postgresDB from "../../db/databaseLocalPG.js";
import mailgun from "mailgun-js";

const URL = process.env.URL;

const router = express.Router();
const db = postgresDB;
//mailgun config data, needs to be set to be imported if not available in process.env
const API_KEY = process.env.API_KEY || 1;
const DOMAIN = process.env.DOMAIN_KEY || 1;

const mg = new mailgun({ apiKey: API_KEY, domain: DOMAIN });

function emailIsValid(email) {
    return /\S+@\S+\.\S+/.test(email);
}

const passwordIsValid = function (password) {
    //Minimum eight characters, at least one letter, one number and one special character:
    console.log("testing pw", password);
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
};

router.post("/register", (req, res) => {
    const pwText = format("%L", req.body.pwText);
    const emailText = format("%L", req.body.emailText);
    const validateKey = process.env.EMAIL === "true" ? cryptoRandomString({ length: 32 }) : "pass";
    const checkEmail = `SELECT email FROM users WHERE email = ${emailText}`;
    const requireConfirm = process.env.EMAIL === "true" ? false : true; //if EMAIL set to false, insert true into db so that confirmation email is not necesarry.
    const createUser = `
    INSERT INTO users (
        password, 
        email, 
        confirmemaillink, 
        resetpasswordlink,
        exchangelist,
        defaultexchange,
        ratelimit,
        apiKey,
        webhook,
        emailconfirmed
        ) 
    VALUES (
        '${sha512(pwText)}',
        ${emailText},
        '${validateKey}', 
        '0',
        'US',
        'US',
        1,
        '',
        '',
        ${requireConfirm}
    )
        RETURNING *`;

    const checkEmailUnique = () => {
        // console.log(checkEmail)
        return new Promise((resolve, reject) => {
            db.query(checkEmail, (err, rows) => {
                if (err) {
                    reject("email check error");
                } else if (rows.rowCount !== 0) {
                    reject("Email already taken");
                } else {
                    resolve("Email Available.");
                }
            });
        });
    };

    const createNewUser = () => {
        return new Promise((resolve, reject) => {
            db.query(createUser, (err, res) => {
                if (res !== undefined) {
                    if (process.env.EMAIL === "true") {
                        const data = {
                            from: "Glenn Streetman <glennstreetman@gmail.com>",
                            to: req.body.emailText,
                            subject: "finnHub Verify Email",
                            text: `Please visit the following link to verify your email address and login to finnDash: ${URL}/verifyEmail?id=${validateKey}`,
                        };
                        if (req.body.emailText.indexOf("@test.com") === -1) {
                            mg.messages().send(data, (error) => {
                                if (error) {
                                    console.log("mailgun register error", error);
                                }
                            });
                        }
                    }
                    resolve();
                } else {
                    reject("Failed to register");
                }
            });
        });
    };

    if (emailIsValid(req.body.emailText) === true && passwordIsValid(req.body.pwText) === true) {
        checkEmailUnique()
            .then((data) => {
                return createNewUser();
            })
            .then((data) => {
                const registrationMessage =
                    process.env.EMAIL === "true"
                        ? "Thank you for registering, please check your email and follow the confirmation link."
                        : "Thank you for registering. You can now login.";
                res.status(200).json({ message: registrationMessage });
            })
            .catch((err) => {
                console.log("EMAIL VALIDATION ERROR:", err);
                res.status(400).json({ message: "Username or email already taken" });
            });
    } else {
        res.status(401).json({ message: "Enter a valid email address & check other info." });
    }
});

export default router;
