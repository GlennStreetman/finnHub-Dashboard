//setup express
import express from "express";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import request from "supertest";
import db from "../../db/databaseLocalPG.js";
import forgot from "./forgot.js";
import sha512 from "./../../db/sha512.js";

const app = express();
dotenv.config();
app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies

app.use("/", forgot); //route to be tested needs to be bound to the router.

beforeAll((done) => {
    const setupDB = `
        INSERT INTO users (
            loginname, email, password,	
            apikey, webhook, confirmemaillink, 
            passwordconfirmed, exchangelist, defaultexchange, ratelimit
        )
        VALUES (	
            'forgotTest',	'forgotTest@test.com',	'${sha512("testpw")}',	'',	'',	'verifyChange12345',	
            '1',	'US',	'US',	30	
        )
        ON CONFLICT
        DO NOTHING
        ;
    `;

    db.connect((err) => {
        if (err) {
            console.log("connection error", err.stack);
        } else {
            db.query(setupDB, (err) => {
                if (err) {
                    console.log("forgot beforeAll setup error.");
                }
                done();
                return true;
            });
        }
    });
});

afterAll((done) => {
    db.end(done());
});

test("bad email get/forgot", (done) => {
    request(app)
        .get(`/api/forgot?loginText=badEmail@gmail.com`)
        .expect("Content-Type", /json/)
        .expect({ message: "Email not found." })
        .expect(401, done);
});

test("no email get/forgot", (done) => {
    request(app).get(`/api/forgot?loginText=`).expect("Content-Type", /json/).expect({ message: "Email not found." }).expect(401, done);
});

test("bad param get/forgot", (done) => {
    request(app).get(`/api/forgot?badParam=`).expect("Content-Type", /json/).expect({ message: "Email not found." }).expect(401, done);
});

test("missing param get/forgot", (done) => {
    request(app).get(`/api/forgot`).expect("Content-Type", /json/).expect({ message: "Email not found." }).expect(401, done);
});
