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

const checkLogin = require("./checkLogin.js");
const login = require("./login.js");
app.use('/', checkLogin) //route to be tested needs to be bound to the router.
app.use('/', login) //needed fo all routes that require login.

beforeAll(() => {
    global.sessionStorage = {}
    
    return (db.connect()
        .then(() => console.log("connected to developement postgres server"))
        .catch(err => console.log("Failed to connect to DB:", err)))
});

afterAll(()=>{
    db.end()
})

test("Check logged out: get/checkLogin", (done) => {
    request(app)
        .get("/checkLogin")
        .set('cookie', [])
        .expect("Content-Type", /json/)
        .expect({
            login: 0,
        })
        .expect(200, done);
});

describe('Get login cookie:', ()=>{
    beforeEach(function (done) {
        request(app)
            .get("/login?loginText=test&pwText=testpw")
            .end(function (err, res) {
            if (err) {
                throw err;
            }
            done();
        });

    })
    test("Check logged in: get/checkLogin", (done) => {       
        request(app)
            .get("/checkLogin")
            .expect("Content-Type", /json/)
            .expect({
                login: 1,
            })
            .expect(200, done(console.log("LOGGIN CHEC SUCCESS!")));
        })
    })




