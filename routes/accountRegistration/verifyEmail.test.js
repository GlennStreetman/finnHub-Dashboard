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

const verifyEmail = require("./verifyEmail.js");
app.use('/', verifyEmail) //route to be tested needs to be bound to the router.


beforeAll((done) => {
    const setupDB = `
        INSERT INTO users (
            loginname, email, password,	secretquestion,	
            secretanswer, apikey, webhook, confirmemaillink, 
            resetpasswordlink, exchangelist, defaultexchange, ratelimit
        )
        VALUES (	
            'verifyEmailTest',	'verifyEmailTest@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
            '69faab6268350295550de7d587bc323d',	'',	'',	'testConfirmEmail',	
            '1',	'US',	'US',	30	
        )
        ON CONFLICT
        DO NOTHING
        ;

        UPDATE users 
        SET confirmemaillink = 'testConfirmEmail', emailconfirmed = false
        WHERE loginname = 'verifyEmailTest';
    `
    // console.log(setupDB)
    db.connect()
    db.query(setupDB, (err) => {
        if (err) {
            console.log("verifyEmail beforeAll setup error.");
        } else {
            console.log("verifyEmail db setup success")
            done()
        }
    })
})

afterAll((done)=>{
    db.end(done())
})

//good verify link
test("Verify email get/verifyEmail", (done) => {       
    request(app)
        .get(`/verifyEmail?id=testConfirmEmail`)
        .expect("Content-Type", /text\/plain/)
        .expect(302)
        .then(() => {
            const testEmailUpdate = `SELECT * FROM users where email = 'verifyEmailTest@test.com' AND emailconfirmed = '1'`
            // console.log("TEST SELECT", testEmailUpdate)
                db.query(testEmailUpdate, (err, rows) => { 
                    // console.log('ROWS: ', rows)
                    if (err) {
                        console.log("Problem verifying get/verifyEmail")
                    } else {
                        expect(rows.rowCount).toBe(1)
                        done()
                    }
                })
        })
})

//bad verify link
test("Verify email get/verifyEmail", (done) => {       
    request(app)
        .get(`/verifyEmail?id=badVerifyLink`)
        .expect("Content-Type", /text\/plain/)
        .expect(406)
        done()
})

//missing param verify link
test("Verify email get/verifyEmail", (done) => {       
    request(app)
        .get(`/verifyEmail?id=`)
        .expect("Content-Type", /text\/plain/)
        .expect(406)
        done()
})