
const request = require("supertest");
const express = require("express");
const app = express();

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

const login = require("./login.js");
const db = require("../../db/databaseLocalPG.js");
app.use('/', login) //route to be tested needs to be bound to the router.

beforeAll(() => {
    global.sessionStorage = {}
    return (db.connect()
        .then(() => console.log("connected to developement postgres server"))
        .catch(err => console.log("Failed to connect to DB:", err)))
    });

afterAll((done)=>{
    db.end(done)
})

//good login
test("Check good login get/login", (done) => {
    request(app)
        .get("/login?loginText=test&pwText=testpw")
        .expect("Content-Type", /json/)
        .expect({
            key: "c0i3dun48v6qfc9d1p5g", 
            login: 1,
            ratelimit: 30,
            response: 'success',
            exchangelist: 'US',
            defaultexchange: 'US',
        })
        .expect(200, done);
});
//bad user name
test("Check wrong login name get/login", (done) => {
    request(app)
        .get("/login?loginText=badUserName&pwText=testpw")
        .expect("Content-Type", /json/)
        .expect({
            response: 'Login/Password did not match.',
            key: "", 
            login: 0,
            ratelimit: 25,
            exchangelist: '',
            defaultexchange: '',
        })
        .expect(200, done);
});

//bad pw
test("Check wrong pw get/login", (done) => {
    request(app)
        .get("/login?loginText=test&pwText=badPw")
        .expect("Content-Type", /json/)
        .expect({
            response: 'Login/Password did not match.',
            key: "", 
            login: 0,
            ratelimit: 25,
            exchangelist: '',
            defaultexchange: '',
        })
        .expect(200, done);
});

//missing paramaters.
test("Check missing paramaters get/login", (done) => {
    request(app)
        .get("/login?loginText=&pwText=")
        .expect("Content-Type", /json/)
        .expect({
            response: 'Login/Password did not match.',
            key: "", 
            login: 0,
            ratelimit: 25,
            exchangelist: '',
            defaultexchange: '',
        })
        .expect(200, done);
});

//confirm email.
test("Email not confirmed get/login", (done) => {
    request(app)
        .get("/login?loginText=test2&pwText=testpw")
        .expect("Content-Type", /json/)
        .expect({
            response: 'Please confirm your email address.',
            key: "", 
            login: 0,
            ratelimit: 25,
            exchangelist: '',
            defaultexchange: '',
        })
        .expect(200, done);
});

//bad data
test("Check missing paramaters get/login", (done) => {
    request(app)
        .get("/login?loginText=SELECT%*%FROM%USERS&pwText=")
        .expect("Content-Type", /json/)
        .expect({
            response: 'Login/Password did not match.',
            key: "", 
            login: 0,
            ratelimit: 25,
            exchangelist: '',
            defaultexchange: '',
        })
        .expect(200, done);
});