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

//postgres test db.
const db = require("../../db/databaseLocalPG.js");

//required for sesssion management and sending cookies with requests
const request = require("supertest");

const findSecret = require("./findSecret.js");
app.use('/', findSecret) //route to be tested needs to be bound to the router.

beforeAll((done) => {
    const setupDB = `
        INSERT INTO users (
            loginname, email, password,	secretquestion,	
            secretanswer, apikey, webhook, confirmemaillink, 
            passwordconfirmed, exchangelist, defaultexchange, ratelimit
        )
        VALUES (	
            'findSecretTest',	'findSecretTest@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
            '69faab6268350295550de7d587bc323d',	'',	'',	'verifyChange12345',	
            '1',	'US',	'US',	30	
        )
        ON CONFLICT
        DO NOTHING
        ;

        INSERT INTO users (
            loginname, email, password,	secretquestion,	
            secretanswer, apikey, webhook, confirmemaillink, 
            passwordconfirmed, exchangelist, defaultexchange, ratelimit
        )
        VALUES (	
            'findSecretTest_not_verified',	'findSecretTest_not_verified@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
            '69faab6268350295550de7d587bc323d',	'',	'',	'verifyChange12345',	
            '0',	'US',	'US',	30	
        )
        ON CONFLICT
        DO NOTHING
        ;

        UPDATE users
        SET passwordconfirmed = true
        WHERE loginname = 'findSecretTest'
    `
    // console.log(setupDB)
    db.connect(err => {
        if (err) {
            console.log('connection error', err.stack)
        } else {
            db.query(setupDB, (err) => {
                if (err) {
                    console.log("findSecret beforeAll setup error.");
                } 
                done()
                return (console.log('findSecret setup complete'))
            }) 
        }
    })
})

afterAll((done)=>{
    db.end(done())
})

//good verify link
test("Get secret question get/findSecret", (done) => {       
    request(app)
        .get(`/findSecret?user=findSecretTest`)
        .expect("Content-Type", /json/)
        .expect(
            {
                question: 'hello',
                user: 'findSecretTest',
            }
        )
        .expect(200, done);
})

test("reset pw !== 1 get/findSecret", (done) => {       
    request(app)
        .get(`/findSecret?user=findSecretTest_not_verified`)
        .expect("Content-Type", /json/)
        .expect(401, done);
})

test("bad user get/findSecret", (done) => {       
    request(app)
        .get(`/findSecret?user=badUser`)
        .expect("Content-Type", /json/)
        .expect(401, done);
})

test("missing param get/findSecret", (done) => {       
    request(app)
        .get(`/findSecret?user=`)
        .expect("Content-Type", /json/)
        .expect(401, done);
})
