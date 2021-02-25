//setup express
const express = require("express");
const app = express();
const md5 = require("md5");
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

beforeAll((done) => {
    const setupDB = `
    INSERT INTO users (
        loginname, email, password,	secretquestion,	
        secretanswer, apikey, webhook, confirmemaillink, 
        passwordconfirmed, exchangelist, defaultexchange, ratelimit,
        resetpasswordlink
    )
    VALUES (	
        'newPWTest', 'newPWTest@test.com', '735a2320bac0f32172023078b2d3ae56',	'hello',	
        '${md5('goodbye')}',	'',	'',	'',	
        true,	'US',	'US',	30,
        'testpasswordlink'
    )
    ON CONFLICT
    DO NOTHING
    ;
    UPDATE users 
    SET passwordconfirmed = true,  resetpasswordlink = 'testpasswordlink'
    WHERE loginname = 'newPWTest'
`   

    global.sessionStorage = {}
    db.connect(err => {
        if (err) {
            console.log('connection error', err.stack)
        } else {
            db.query(setupDB, (err) => {
                if (err) {
                    console.log("Problem setting up reset test.");
                } 
                done()
            }) 
        }
    })
})

afterAll((done)=>{
    db.end(done())
})

test("Fail to set new password get/newPW", (done) => {       
    request(app)
        .get(`/newPW?newPassword=testpw`)
        .expect({message: "Password not updated, restart process."})
        .expect(401, done)
    })

describe('Get login cookie:', ()=>{
    let cookieJar = ''
    beforeAll(function (done) {
        request(app)
            .get("/secretQuestion?loginText=goodbye&user=newPWTest")
            .then(res => {
                console.log("SECRET RESPONSE", res.statusCode)
                cookieJar = res.header['set-cookie']
                console.log(cookieJar)
                done()
            })
    })

    test("Set new password get/newPW", (done) => {       
        request(app)
            .get(`/newPW?newPassword=testpw`)
            .set('Cookie', cookieJar)
            .expect({message: "true"})
            .expect(200)
            .then(() => {
                request(app)
                    .get(`/newPW?newPassword=testpw`)
                    .set('Cookie', cookieJar)
                    .expect({message: "Password not updated, restart process."})
                    .expect(401, done)
            })
        })
    
})







