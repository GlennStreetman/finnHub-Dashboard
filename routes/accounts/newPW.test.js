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

const newPW = require("./newPW.js");
const secretQuestion = require("./../accountRegistration/secretQuestion.js");
app.use('/', newPW) //route to be tested needs to be bound to the router.
app.use('/', secretQuestion) //needed fo all routes that require login.

beforeAll(() => {
    global.sessionStorage = {}
    db.connect(err => {
        if (err) {
            console.log('connection error', err.stack)
        } 
    })
})

afterAll((done)=>{
    db.end(done())
})

describe('Get login cookie:', ()=>{
    let cookieJar = ''
    beforeAll(function (done) {
        request(app)
            .get("/secretQuestion?loginText=goodbye&user=test_newPW")
            .then(res => {
                cookieJar = res.header['set-cookie']
                // expect("Content-Type", /json/)
                expect({message: "correct"})
                expect(200)
                done()
            })
    })

    test("Get secret question get/newPW", (done) => {       
        // console.log("-----------------STARTING TESTS-----------")
        request(app)
            .get(`/newPW?newPassword=testpw`)
            .set('Cookie', cookieJar)
        .then(() => {
            // expect("Content-Type", /json/)
            expect({message: "true"})
            expect(200)
        })
        .then(() => {
            request(app)
                .get(`/newPW?newPassword=testpw`)
                .set('Cookie', cookieJar)
                .then(()=>{
                    // expect("Content-Type", /json/)
                    expect({message: "Password not updated, restart process."})
                    expect(401)
                    done()
                })  
        })
        
    })
})

