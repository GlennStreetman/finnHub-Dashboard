//setup express
import express from "express";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import request from "supertest";
import sessionFileStore from "session-file-store";
import db from "../../db/databaseLocalPG.js";
import register from "./register.js";
import sha512 from "./../../db/sha512.js";
console.log("setting up express test");
const app = express();
dotenv.config();

app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies
app.use(cookieParser());

const FileStore = sessionFileStore(session);

const fileStoreOptions = {};
app.use(
    session({
        store: new FileStore(fileStoreOptions),
        secret: process.env.session_secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, sameSite: true },
    })
);

//postgres test db.

app.use("/", register); //route to be tested needs to be bound to the router.

beforeAll((done) => {
    global.sessionStorage = {};
    const setupDB = `
    ;INSERT INTO users (
        loginname, email, password,	secretquestion,	
        secretanswer, apikey, webhook, confirmemaillink, 
        resetpasswordlink, exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'registertest_taken',	'registertest_taken@test.com',	'${sha512("testpw")}',	'hello',	
        '${sha512("goodbye")}',	'',	'',	'071e3afe81e12ff2cebcd41164a7a295',	
        '1',	'US',	'US',	30	
    )
    ON CONFLICT
    DO NOTHING
    
    ;DELETE FROM users WHERE loginname = 'registerTest'`;

    db.connect();
    db.query(setupDB, (err) => {
        if (err) {
            console.log("verifyEmail beforeAll setup error.");
        } else {
            done();
        }
    });
});

// afterAll((done)=>{
//     db.end(done())
// })

test("Valid new login post/register", (done) => {
    request(app)
        .post("/register")
        .send({
            loginText: "registerTest",
            pwText: "testpw",
            emailText: "registerTest@test.com",
            secretQuestion: "hellotest",
            secretAnswer: "goodbye",
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
        .post("/register")
        .send({
            loginText: "test3",
            pwText: "dontlogin",
            emailText: "testtest.com",
            secretQuestion: "hellotest",
            secretAnswer: "goodbye",
        })
        .expect({ message: "Enter a valid email address & check other info." })
        .expect(401, done);
});

test("No email post/register", (done) => {
    request(app)
        .post("/register")
        .send({
            loginText: "test3",
            pwText: "dontlogin",
            emailText: "",
            secretQuestion: "testquestion",
            secretAnswer: "testquestion",
        })
        .expect({ message: "Enter a valid email address & check other info." })
        .expect(401, done);
});

test("No user post/register", (done) => {
    request(app)
        .post("/register")
        .send({
            loginText: "",
            pwText: "dontlogin",
            emailText: "test@test.com",
            secretQuestion: "testquestion",
            secretAnswer: "testquestion",
        })
        .expect({ message: "Enter a valid email address & check other info." })
        .expect(401, done);
});

test("No password post/register", (done) => {
    request(app)
        .post("/register")
        .send({
            loginText: "test3",
            pwText: "",
            emailText: "test@test.com",
            secretQuestion: "testquestion",
            secretAnswer: "testquestion",
        })
        .expect({ message: "Enter a valid email address & check other info." })
        .expect(401, done);
});

test("No secret question post/register", (done) => {
    request(app)
        .post("/register")
        .send({
            loginText: "test3",
            pwText: "dontlogin",
            emailText: "test@test.com",
            secretQuestion: "",
            secretAnswer: "testquestion",
        })
        .expect({ message: "Enter a valid email address & check other info." })
        .expect(401, done);
});

test("No secret answer post/register", (done) => {
    request(app)
        .post("/register")
        .send({
            loginText: "test3",
            pwText: "dontlogin",
            emailText: "test@test.com",
            secretQuestion: "testquestion",
            secretAnswer: "",
        })
        .expect({ message: "Enter a valid email address & check other info." })
        .expect(401, done);
});

test("User name already taken post/register", (done) => {
    request(app)
        .post("/register")
        .send({
            loginText: "registertest_taken",
            pwText: "testPW",
            emailText: "registertest_taken@test.com",
            secretQuestion: "testquestion",
            secretAnswer: "testanswer",
        })
        .expect({ message: "Username or email already taken" })
        .expect(400, done);
});

test("Email already taken post/register", (done) => {
    request(app)
        .post("/register")
        .send({
            loginText: "registertest_taken_emailTaken",
            pwText: "testPW",
            emailText: "registertest_taken@test.com",
            secretQuestion: "testquestion",
            secretAnswer: "testanswer",
        })
        .expect({ message: "Username or email already taken" })
        .expect(400, done);
});
