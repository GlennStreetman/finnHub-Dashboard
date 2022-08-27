//setup express
import express from "express";
import dotenv from "dotenv";
import path from "path";
import request from "supertest";
import bodyParser from "body-parser";
import db from "../../db/databaseLocalPG.js";
import verifyEmail from "./verifyEmail.js";

const app = express();
dotenv.config();
app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies
app.use("/", verifyEmail); //route to be tested needs to be bound to the router.

beforeAll((done) => {
    const setupDB = `
        INSERT INTO users (
            email, password,
            apikey, webhook, confirmemaillink, 
            resetpasswordlink, exchangelist, defaultexchange, ratelimit
        )
        VALUES (	
            'verifyEmailTest@test.com',	'735a2320bac0f32172023078b2d3ae56',
            '',	'',	'testConfirmEmail',	
            '1',	'US',	'US',	30	
        )
        ON CONFLICT
        DO NOTHING
        ;

        UPDATE users 
        SET confirmemaillink = 'testConfirmEmail', emailconfirmed = false
        WHERE email = 'verifyEmailTest@test.com';
    `;
    // console.log(setupDB)
    db.connect();
    db.query(setupDB, (err) => {
        if (err) {
            console.log("verifyEmail beforeAll setup error.");
        } else {
            console.log("verifyEmail db setup success");
            done();
        }
    });
});

afterAll((done) => {
    db.end(done());
});

//good verify link
test("Verify email get/verifyEmail", (done) => {
    request(app)
        .get(`/api/verifyEmail?id=testConfirmEmail`)
        .expect("Content-Type", /text\/plain/)
        .expect(302)
        .then(() => {
            const testEmailUpdate = `SELECT * FROM users where email = 'verifyEmailTest@test.com' AND emailconfirmed = '1'`;
            // console.log("TEST SELECT", testEmailUpdate)
            db.query(testEmailUpdate, (err, rows) => {
                // console.log('ROWS: ', rows)
                if (err) {
                    console.log("Problem verifying get/verifyEmail");
                } else {
                    expect(rows.rowCount).toBe(1);
                    done();
                }
            });
        });
});

//bad verify link
test("Verify email get/verifyEmail", (done) => {
    request(app)
        .get(`/api/verifyEmail?id=badVerifyLink`)
        .expect("Content-Type", /text\/plain/)
        .expect({ message: "Failed to verify new email address." })
        .expect(401);
    done();
});

//missing param verify link
test("Verify email get/verifyEmail", (done) => {
    request(app)
        .get(`/api/verifyEmail?id=`)
        .expect("Content-Type", /text\/plain/)
        .expect({ message: "Failed to verify new email address." })
        .expect(401);
    done();
});
