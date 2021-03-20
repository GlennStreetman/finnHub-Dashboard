//setup express
import express from 'express';
const app = express();
// const router = express.Router();
require('dotenv').config()
import path from 'path';
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.urlencoded({ extended: false }));
import bodyParser from 'body-parser';
app.use(bodyParser.json()); // support json encoded bodies
import cookieParser from 'cookie-parser';
app.use(cookieParser());
import session from 'express-session';
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

beforeAll((done) => {
    global.sessionStorage = {}

    const setupDB = `
    INSERT INTO users (
        loginname, email, password,	secretquestion,	
        secretanswer, apikey, webhook, emailconfirmed, 
        passwordconfirmed, exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'loginCheck',	'loginCheck@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
        '69faab6268350295550de7d587bc323d',	'',	'',	'1',	
        '1',	'US',	'US',	30	
    )
    ON CONFLICT
    DO NOTHING
    ;`

    db.connect()
    db.query(setupDB, (err) => {
        if (err) {
            console.log("verifyEmail beforeAll setup error.");
        } else {
            console.log("verifyEmail db setup success")
            done()
        }
    })

});

afterAll((done)=>{
    db.end(done())
})

test("Check logged out: get/checkLogin", (done) => {
    request(app)
        .get("/checkLogin")
        .expect("Content-Type", /json/)
        .expect({login: 0,})
        .expect(401)
        .end(done)
});

describe('Get login cookie:', ()=>{
    let cookieJar = ''
    beforeEach(function (done) {
        request(app)
            .get("/login?loginText=loginCheck&pwText=testpw")
            .then(res => {
                cookieJar = res.header['set-cookie']
                done()
            })
        });

    test("Check logged in: get/checkLogin", (done) => {       
        request(app)
            .get("/checkLogin")
            .set('Cookie', cookieJar)
            .expect("Content-Type", /json/)
            .expect({
                login: 1,
                apiKey: '',
                exchangelist: 'US',
                defaultexchange: 'US',
                ratelimit: 30,
            })
            .expect(200)
            .end(done)
        })
    })




