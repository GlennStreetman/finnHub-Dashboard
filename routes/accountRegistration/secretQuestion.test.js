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

const secretQuestion = require("./secretQuestion.js");
const login = require("./../loginRoutes/login.js");
app.use('/', secretQuestion) //route to be tested needs to be bound to the router.
app.use('/', login) //needed fo all routes that require login.

beforeAll(() => {
    global.sessionStorage = {}
    db.connect()
    return (console.log('test setup complete'))
})

afterAll((done)=>{
    db.end(done())
})

test("Check correct secret question answer get/secretQuestion", (done) => {       
    request(app)
        .get(`/secretQuestion?loginText=goodbye&user=test`)
        .expect("Content-Type", /json/)
        .expect(200, done);
})

test("Check incorrect secret question answer get/secretQuestion", (done) => {       
    request(app)
        .get(`/secretQuestion?loginText=badAnswer&user=test`)
        .expect("Content-Type", /json/)
        .expect(406, done);
})

test("Check no secret question answer get/secretQuestion", (done) => {       
    request(app)
        .get(`/secretQuestion?loginText=&user=test`)
        .expect("Content-Type", /json/)
        .expect(406, done);
})

test("Check not secret question user get/secretQuestion", (done) => {       
    request(app)
        .get(`/secretQuestion?loginText=badAnswer&user=`)
        .expect("Content-Type", /json/)
        .expect(406, done);
})