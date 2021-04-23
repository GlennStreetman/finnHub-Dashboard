//setup express
import express from 'express';
import dotenv from 'dotenv'; 
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import request from 'supertest';
import sessionFileStore from 'session-file-store';
import db from '../../db/databaseLocalPG.js';
import accountData from "./accountData.js";
import login from "./../loginRoutes/login.js";

const app = express();
dotenv.config()
app.use(express.static(path.join(__dirname, 'build')));
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
)

app.use('/', accountData) //route to be tested needs to be bound to the router.
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
        'accountDataTest',	'accountDataTest@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
        '69faab6268350295550de7d587bc323d',	'',	'',	'1',	
        '1',	'US',	'US',	30	
    )
    , (	
        'accountDataPOSTTest',	'accountDataPOSTTest@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
        '69faab6268350295550de7d587bc323d',	'',	'',	'1',	
        '1',	'US',	'US',	30	
    )
    ON CONFLICT
    DO NOTHING
    `

    db.connect()
    db.query(setupDB, (err) => {
        if (err) {
            console.log("accountData setup error.");
        } else {

            done()
        }
    })

});

afterAll((done)=>{
    db.end(done())
})

test("Check not logged in: get/accountData", (done) => {       
    request(app)
        .get("/accountData")
        .expect("Content-Type", /json/)
        .expect({
            message: "Not logged in."
        })
        .expect(401)
        .end(done)
    })

describe('Get login cookie:', ()=>{
    //TEST GET ROUTE
    let cookieJar = ''
    beforeEach(function (done) {
        request(app)
            .get("/login?loginText=accountDataTest&pwText=testpw")
            .then(res => {
                cookieJar = res.header['set-cookie']
                expect(200)
                done()
            })
        });

    test("Check get data: get/accountData", (done) => {       
        request(app)
            .get("/accountData")
            .set('Cookie', cookieJar)
            .expect("Content-Type", /json/)
            .expect({
                userData: {
                    loginname: 'accountDataTest',
                    email: 'accountDataTest@test.com',
                    apikey: '',
                    webhook: '',
                    ratelimit: 30,
                    apialias: null,
                    widgetsetup: null, 
                }
            })
            .expect(200)
            .then(()=>{
                request(app).get("/logOut")
            })
            .then(()=>{
                //check that logging out returns correct result.
                request(app).get("/accountData")
                .expect("Content-Type", /json/)
                .expect({
                    message: "Not logged in."
                })
                .expect(401)
                .end(done)
            })
        })
    })

    describe('Get login cookie POST:', ()=>{
        //TEST GET ROUTE
        let cookieJar = ''
        beforeAll(function (done) {
            request(app)
                .get("/login?loginText=accountDataPOSTTest&pwText=testpw")
                .then(res => {
                    cookieJar = res.header['set-cookie']
                    expect(200)
                    done()
                })
            });
        
            test("Check update data, good field: post/accountData", (done) => {       
                request(app)
                .post("/accountData")
                .send({ 
                    field: "ratelimit",
                    newValue: "29",
                })
                .set('Cookie', cookieJar)
                .expect("Content-Type", /json/)
                .expect({
                        message: `ratelimit updated`,
                        data: '29',
                })
                .expect(200, done)
            })

            test("Check update data, good email post/accountData", (done) => {       
                request(app)
                .post("/accountData")
                .send({ 
                    field: "email",
                    newValue: "testgoodemail@test.com",
                })
                .set('Cookie', cookieJar)
                .expect("Content-Type", /json/)
                .expect({message: `Please check email to verify change.`})
                .expect(200, done)
            })

            test("Check update data, bad email post/accountData", (done) => {       
                request(app)
                .post("/accountData")
                .send({ 
                    field: "email",
                    newValue: "testgoodemailtest.com",
                })
                .set('Cookie', cookieJar)
                .expect("Content-Type", /json/)
                .expect({message: `email not valid`})
                .expect(401, done)
            })
            
})    