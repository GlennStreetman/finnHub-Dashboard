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

router.post("/register", (req, res) => {
    // console.log(req.body)
    const loginText = format("%L", req.body.loginText);
    const pwText = format("%L", req.body.pwText);
    const emailText = format("%L", req.body.emailText);
    const secretQuestion = format("%L", req.body.secretQuestion);
    const secretAnswer = format("%L", req.body.secretAnswer);
    // console.log(loginText, pwText, emailText, secretQuestion, secretAnswer)
    const validateKey = process.env.EMAIL === "true" ? cryptoRandomString({ length: 32 }) : "pass";
    const checkUser = `SELECT loginName FROM users WHERE loginName = ${loginText}`;
    const checkEmail = `SELECT email FROM users WHERE email = ${emailText}`;
    const requireConfirm = process.env.EMAIL === "true" ? false : true; //if EMAIL set to false, insert true into db so that confirmation email is not necesarry.
    const createUser = `
    INSERT INTO users (
        loginName, 
        password, 
        email, 
        secretQuestion, 
        secretAnswer, 
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
        ${loginText},
        '${sha512(pwText)}',
        ${emailText},
        ${secretQuestion},
        '${sha512(secretAnswer)}', 
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

    function emailIsValid(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    function validateInfo() {
        if (
            loginText.length >= 3 &&
            pwText.length >= 6 &&
            emailText.length >= 1 && //validated in next step.
            secretQuestion.length >= 8 &&
            secretAnswer.length >= 4
        ) {
            return true;
        } else {
            return false;
        }
    }

    const checkUserStatus = () => {
        // console.log(checkUser)
        return new Promise((resolve, reject) => {
            db.query(checkUser, (err, rows) => {
                if (err) {
                    console.log("user check error");
                    reject("User check error");
                } else if (rows.rowCount !== 0) {
                    // console.log("User name already taken. REJECTING");
                    reject("User Name Already Taken");
                } else {
                    resolve("User Name Available");
                }
            });
        });
    };

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
                    if (process.env.EMAIL) {
                        const data = {
                            from: "Glenn Streetman <glennstreetman@gmail.com>",
                            to: req.body.emailText,
                            subject: "finnHub Verify Email",
                            text: `Please visit the following link to verify your email address and login to finnDash: ${URL}/verifyEmail?id=${validateKey}`,
                        };
                        if (req.body.emailText.indexOf("@test.com") === -1) {
                            mg.messages().send(data, (error) => {
                                if (error) {
                                    console.log("register error", error);
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

    if (emailIsValid(emailText) === true && validateInfo() === true) {
        checkUserStatus()
            .then((data) => {
                return checkEmailUnique();
            })
            .then((data) => {
                // console.log(data)
                return createNewUser();
            })
            .then((data) => {
                const registrationMessage =
                    process.env.EMAIL === "true"
                        ? "Thank you for registering, please check your email and follow the confirmation link."
                        : "Thank you for registering. You can now login.";
                console.log(process.env.EMAIL, registrationMessage);
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
