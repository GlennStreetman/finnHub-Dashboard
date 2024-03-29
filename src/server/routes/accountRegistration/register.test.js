//setup express
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import request from "supertest";
import db from "../../db/databaseLocalPG.js";
import register from "./register.js";
import sha512 from "./../../db/sha512.js";
console.log("setting up express test");
const app = express();
dotenv.config();

app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: false }));
app.use(
    bodyParser.json({
        limit: "50mb",
    })
); // support json encoded bodies
app.use(
    bodyParser.urlencoded({
        parameterLimit: 100000,
        limit: "50mb",
        extended: true,
    })
);

app.use("/", register); //route to be tested needs to be bound to the router.

beforeAll((done) => {
    global.sessionStorage = {};
    const setupDB = `
    ;INSERT INTO users (
        email, password, apikey, webhook, confirmemaillink, 
        resetpasswordlink, exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'registertest_taken@test.com',	'${sha512("testpw")}',
        '',	'',	'071e3afe81e12ff2cebcd41164a7a295',	
        '1',	'US',	'US',	30	
    )
    ON CONFLICT
    DO NOTHING
    
    ;DELETE FROM users WHERE email = 'registerTest@test.com'`;

    db.connect();
    db.query(setupDB, (err) => {
        if (err) {
            console.log("verifyEmail beforeAll setup error.");
        } else {
            console.log("db setup complete");
            done();
        }
    });
});

test("Valid new login post/register", (done) => {
    request(app)
        .post("/api/register")
        .send({
            pwText: "Testpw123!",
            emailText: "registerTest@test.com",
        })
        // .set('Accept', 'application/json')
        .expect("Content-Type", /json/)
        .expect({
            message: "Thank you for registering. You can now login.",
        })
        .expect(200, done);
});

test("Invalid email post/register", (done) => {
    request(app)
        .post("/api/register")
        .send({
            pwText: "dontlogin",
            emailText: "testtest.com",
        })
        .expect({ message: "Enter a valid email address & check other info." })
        .expect(401, done);
});

test("No email post/register", (done) => {
    request(app)
        .post("/api/register")
        .send({
            pwText: "dontlogin",
            emailText: "",
        })
        .expect({ message: "Enter a valid email address & check other info." })
        .expect(401, done);
});

test("No user post/register", (done) => {
    request(app)
        .post("/api/register")
        .send({
            pwText: "dontlogin",
            emailText: "test@test.com",
        })
        .expect({ message: "Enter a valid email address & check other info." })
        .expect(401, done);
});

test("No password post/register", (done) => {
    request(app)
        .post("/api/register")
        .send({
            pwText: "",
            emailText: "test@test.com",
        })
        .expect({ message: "Enter a valid email address & check other info." })
        .expect(401, done);
});

test("Email already taken post/register", (done) => {
    request(app)
        .post("/api/register")
        .send({
            pwText: "Testpw123!",
            emailText: "registertest_taken@test.com",
        })
        .expect({ message: "Email already registered" })
        .expect(400, done);
});
