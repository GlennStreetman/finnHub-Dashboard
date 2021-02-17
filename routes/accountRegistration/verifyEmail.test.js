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


beforeAll(() => {
    const setupDB = `
        UPDATE users 
        SET confirmemail = '071e3afe81e12ff2cebcd41164a7a295'
        WHERE loginname = 'test2';
    `

    db.connect()
    db.query(setupDB, (err) => {
        if (err) {
        console.log("verifyEmail beforeAll setup error.");
        } else {
        console.log("verifyEmail db setup success")
        }
    return (console.log('verifyEmail setup complete'))
    })
})

afterAll((done)=>{
    db.end(done())
})

//good verify link
test("Verify email get/verifyEmail", (done) => {       
    request(app)
        .get(`/verifyEmail?id=071e3afe81e12ff2cebcd41164a7a295`)
        .expect("Content-Type", /text\/plain/)
        .expect(302)
        .then(() => {
            const testEmailUpdate = `SELECT * FROM users where email = 'test2@test.com' AND confirmemail = '1'`
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
        .get(`/verifyEmail?id=071e3afe81eff2cebcd41164a7a295`)
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