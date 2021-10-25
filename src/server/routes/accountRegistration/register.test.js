//setup express
import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import request from 'supertest';  
import sessionFileStore from 'session-file-store';
import db from '../../db/databaseLocalPG.js';
import register from './register.js';
import { assert } from 'console';

const app = express();
dotenv.config()
const FileStore = sessionFileStore(session);
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies

app.use(cookieParser());


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

app.use('/', register) //route to be tested needs to be bound to the router.

beforeAll((done) => {
    global.sessionStorage = {}
    const setupDB = `
    ;INSERT INTO users (
        loginname, email, password,	secretquestion,	
        secretanswer, apikey, webhook, confirmemaillink, 
        resetpasswordlink, exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'registertest_taken',	'registertest_taken@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
        '69faab6268350295550de7d587bc323d',	'',	'',	'071e3afe81e12ff2cebcd41164a7a295',	
        '1',	'US',	'US',	1	
    )
    ON CONFLICT
    DO NOTHING
    
    ;DELETE FROM users WHERE loginname = 'registerTest'`
    
    db.connect()
    db.query(setupDB, (err) => {
        if (err) {
            console.log("verifyEmail beforeAll setup error.");
        } else {
            done()
        }
    })
})

afterAll((done)=>{
    db.end(done())
})


test("Valid new login post/register", (done) => {

    const messageList = ['Thank you for registering, please check your email and follow the confirmation link.', 'new user created']

    request(app)
        .post("/register")
        .send({
            loginText: "registerTest",
            pwText: "testpw",
            emailText: "registerTest@test.com",
            secretQuestion: "hellotest",
            secretAnswer: "goodbye",
        })
        .expect("Content-Type", /json/)
        .then(res=>{
            assert(messageList.includes(res.body.message, true))
        })
        done()
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
        .expect({message: "Enter a valid email address & check other info."})
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
        .expect({message: "Enter a valid email address & check other info."})
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
        .expect({message: "Enter a valid email address & check other info."})
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
        .expect({message: "Enter a valid email address & check other info."})
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
        .expect({message: "Enter a valid email address & check other info."})
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
        .expect({message: "Enter a valid email address & check other info."})
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
        .expect({message: "Username or email already taken"})
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
        .expect({message: "Username or email already taken"})
        .expect(400, done);
});




