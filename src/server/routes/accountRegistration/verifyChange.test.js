//setup express
import express from 'express';
import dotenv from 'dotenv'; 
import path from 'path';
import request from 'supertest';
import bodyParser from 'body-parser';
import db from '../../db/databaseLocalPG.js';
import verifyChange from "./verifyChange.js";

const app = express();
dotenv.config()
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies
app.use('/', verifyChange) //route to be tested needs to be bound to the router.


beforeAll((done) => {
    const setupDB = `
        INSERT INTO users (
            loginname, email, password,	secretquestion,	
            secretanswer, apikey, webhook, confirmemaillink, 
            resetpasswordlink, exchangelist, defaultexchange, ratelimit
        )
        VALUES (	
            'verifyChangeTest',	'oldEmail@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
            '69faab6268350295550de7d587bc323d',	'',	'',	'verifyChange12345',	
            '0',	'US',	'US',	30	
        )
        ON CONFLICT
        DO NOTHING
        ;

        UPDATE users
        SET email = 'oldEmail@test.com'
        WHERE loginname = 'verifyChangeTest'
        ;  
        
        INSERT INTO newemail (userid, newemail, querystring)
        VALUES ((SELECT id from users where loginname = 'verifyChangeTest'), 
        'newEmail@test.com', 'verifyChange12345');
    `
    // console.log(setupDB)
    db.connect()
    db.query(setupDB, (err) => {
        if (err) {
            console.log("verifyChange beforeAll setup error.");
        } else {
            console.log("verifyChange db setup success")
            done()
        }
    })
})

afterAll((done)=>{
    db.end(done())
})

//succeed in verifying change to user verifyChangeTest
test("Verify email get/verifyChange", (done) => {       
    request(app)
        .get(`/verifyChange?id=verifyChange12345`)
        .expect(302)
        .then(() => {
            const testEmailUpdate = `SELECT * FROM users where email = 'newEmail@test.com'`
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

//fail in verifying change to user verifyChangeTest. Used verify link a second time.
test("Verify email get/verifyChange", (done) => {       
    request(app)
        .get(`/verifyChange?id=verifyChange12345!`)
        .expect("Content-Type", /json/)
        .expect({message: "Failed to verify new email address."})
        .expect(401, done)
})

test("bad verify link get/verifyChange", (done) => {       
    request(app)
        .get(`/verifyChange?id=badLink`)
        .expect("Content-Type", /json/)
        .expect({message: "Failed to verify new email address."})
        .expect(401, done)
})

test("missing verify param get/verifyChange", (done) => {       
    request(app)
        .get(`/verifyChange`)
        .expect("Content-Type", /json/)
        .expect({message: "Failed to verify new email address."})
        .expect(401, done)
})