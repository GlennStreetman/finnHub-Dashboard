//setup express
import express from 'express';
import dotenv from 'dotenv';  
import path from 'path';
import bodyParser from 'body-parser';
import request from 'supertest';
import db from '../../db/databaseLocalPG.js';
import forgot from "./forgot.js";

const app = express();
dotenv.config()
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies

app.use('/', forgot) //route to be tested needs to be bound to the router.

beforeAll((done) => {

    const setupDB = `
        INSERT INTO users (
            loginname, email, password,	secretquestion,	
            secretanswer, apikey, webhook, confirmemaillink, 
            passwordconfirmed, exchangelist, defaultexchange, ratelimit
        )
        VALUES (	
            'forgotTest',	'forgotTest@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
            '69faab6268350295550de7d587bc323d',	'',	'',	'verifyChange12345',	
            '1',	'US',	'US',	30	
        )
        ON CONFLICT
        DO NOTHING
        ;
    `

    db.connect(err => {
        if (err) {
            console.log('connection error', err.stack)
        } else {
            db.query(setupDB, (err) => {
                if (err) {
                    console.log("forgot beforeAll setup error.");
                } 
                done()
                return (true)
            }) 
        }
    })
})

afterAll((done)=>{
    db.end(done())
})

//good verify link
test("Get secret question get/forgot", (done) => {       
    request(app)
        .get(`/forgot?loginText=forgotTest@test.com`)
        .expect("Content-Type", /json/)
        .expect(
            {
                message: "Please check email for recovery instructions."
            }
        )
        .expect(200, done);
})


test("bad email get/forgot", (done) => {       
    request(app)
        .get(`/forgot?loginText=badEmail@gmail.com`)
        .expect("Content-Type", /json/)
        .expect(
            {message: "Email not found."}
        )
        .expect(401, done);
})

test("no email get/forgot", (done) => {       
    request(app)
        .get(`/forgot?loginText=`)
        .expect("Content-Type", /json/)
        .expect(
            {message: "Email not found."}
        )
        .expect(401, done);
})

test("bad param get/forgot", (done) => {       
    request(app)
        .get(`/forgot?badParam=`)
        .expect("Content-Type", /json/)
        .expect(
            {message: "Email not found."}
        )
        .expect(401, done);
})

test("missing param get/forgot", (done) => {       
    request(app)
        .get(`/forgot`)
        .expect("Content-Type", /json/)
        .expect(
            {message: "Email not found."}
        )
        .expect(401, done);
})

