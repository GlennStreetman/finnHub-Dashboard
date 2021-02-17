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

const verifyChange = require("./verifyChange.js");
app.use('/', verifyChange) //route to be tested needs to be bound to the router.


beforeAll(() => {
    const setupDB = `
        UPDATE users 
        SET confirmemail = '071e3afe81e12ff2cebcd41164a7a295'
        , email = ''
        WHERE loginname = 'test2';

        INSERT INTO newemail (userid, newemail, querystring)
        VALUES ((SELECT id from users where loginname = 'test2'), 
            'test2@test.com', '071e3afe81e12ff2cebcd41164a7a295');
    `
    // console.log(setupDB)
    db.connect()
    db.query(setupDB, (err) => {
        if (err) {
        console.log("verifyChange beforeAll setup error.");
        } else {
        console.log("verifyChange db setup success")
        }
    return (console.log('verifyChange setup complete'))
    })
})

afterAll((done)=>{
    db.end(done())
})

test("Verify email get/verifyChange", (done) => {       
    request(app)
        .get(`/verifyChange?id=071e3afe81e12ff2cebcd41164a7a295`)
        .expect("Content-Type", /text\/plain/)
        .expect(302)
        .then(() => {
            const testEmailUpdate = `SELECT * FROM users where email = 'test2@test.com'`
                db.query(testEmailUpdate, (err, rows) => {
                    if (err) {
                        console.log("Problem verifying get/verifyChange")
                    } else {
                    expect(rows.rowCount).toBe(1)
                    done()
                    }
                })
        })
})

test("bad verify link get/verifyChange", (done) => {       
    request(app)
        .get(`/verifyChange?id=071e3afe81e12ff2cebcd41164a`)
        .expect("Content-Type", /json/)
        .expect(406, done)
})

test("missing verify param get/verifyChange", (done) => {       
    request(app)
        .get(`/verifyChange`)
        .expect("Content-Type", /json/)
        .expect(406, done)
})