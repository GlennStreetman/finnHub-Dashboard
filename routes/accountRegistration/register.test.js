//setup express
const express = require("express");
const app = express();
// const router = express.Router();
require('dotenv').config()
const path = require("path");
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.urlencoded({ extended: false }));
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const fileStoreOptions = {};
app.use(
    session({
    store: new FileStore(fileStoreOptions),
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true },
    })
)

//postgres test db.
const db = require("../../db/databaseLocalPG.js");

//required for sesssion management and sending cookies with requests
const request = require("supertest");

const register = require("./register.js");
app.use('/', register) //route to be tested needs to be bound to the router.

beforeAll(() => {
    global.sessionStorage = {}
    db.connect()
    const deletePrevTest = `DELETE FROM users WHERE loginname = 'test3'`
    db.query(deletePrevTest, (err) => {
        if (err) {
        console.log("user check error");
        } else {
        console.log("old tests removed from db.")
        }
    })
    return (console.log('test setup complete'))
})

afterAll((done)=>{
    db.end(done())
})


test("Valid new login post/register", (done) => {

    request(app)
        .post("/register")
        .send({
            loginText: "test3",
            pwText: "dontlogin",
            emailText: "test@test.com",
            secretQuestion: "testquestion",
            secretAnswer: "testquestion",
        })
        // .set('Accept', 'application/json')
        .expect("Content-Type", /json/)
        .expect({
            message: "new user created",
        })
        .expect(200, done);
});

test("Invalid email post/register", (done) => {

    request(app)
        .post("/register")
        .send({
            loginText: "test3",
            pwText: "dontlogin",
            emailText: "test@test.com",
            secretQuestion: "testquestion",
            secretAnswer: "testquestion",
        })
        .expect(406, done);
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
        .expect(406, done);
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
        .expect(406, done);
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
        .expect(406, done);
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
        .expect(406, done);
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
        .expect(406, done);
});

test("User name already taken post/register", (done) => {

    request(app)
        .post("/register")
        .send({
            loginText: "test",
            pwText: "dontlogin",
            emailText: "test@test.com",
            secretQuestion: "testquestion",
            secretAnswer: "testanswer",
        })
        .expect(406, done);
});




