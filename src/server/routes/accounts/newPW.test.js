//setup express
import express from "express";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";
import request from "supertest";
import sessionFileStore from "session-file-store";
import db from "../../db/databaseLocalPG.js";
import bodyParser from "body-parser";
import newPW from "./newPW.js";
import sha512 from "./../../db/sha512.js";

const app = express();
dotenv.config();
app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies
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
);

app.use("/", newPW); //route to be tested needs to be bound to the router.

beforeAll((done) => {
    const setupDB = `
    INSERT INTO users (
        loginname, email, password,	
        apikey, webhook, confirmemaillink, 
        passwordconfirmed, exchangelist, defaultexchange, ratelimit,
        resetpasswordlink
    )
    VALUES (	
        'newPWTest', 'newPWTest@test.com', '${sha512("testpw")}',	
        '',	'',	'',	
        true,	'US',	'US',	30,
        'testpasswordlink'
    )
    ON CONFLICT
    DO NOTHING
    ;
    UPDATE users 
    SET passwordconfirmed = true,  resetpasswordlink = 'testpasswordlink, password=${sha512("testpw")},
    WHERE loginname = 'newPWTest'
`;

    global.sessionStorage = {};
    db.connect((err) => {
        if (err) {
            console.log("connection error", err.stack);
        } else {
            db.query(setupDB, (err) => {
                if (err) {
                    console.log("Problem setting up reset test.");
                }
                console.log("newPW.test setup complete");
                done();
            });
        }
    });
});

afterAll((done) => {
    db.end(done());
});

test("Fail to set new password get/newPW", (done) => {
    request(app).get(`/newPW?newPassword=testpw`).expect({ message: "Password not updated, restart process." }).expect(401, done);
});

describe("Get login cookie:", () => {
    let cookieJar = "";
    beforeAll(function (done) {
        request(app)
            .get("/secretQuestion?loginText=goodbye&user=newPWTest")
            .then((res) => {
                console.log("SECRET RESPONSE", res.statusCode);
                cookieJar = res.header["set-cookie"];
                console.log("cookiejar", cookieJar);
                done();
            });
    });

    test("Set new password get/newPW", (done) => {
        request(app)
            .get(`/newPW?newPassword=testpw`)
            .set("Cookie", cookieJar)
            .expect({ message: "true" })
            .expect(200)
            .then(() => {
                request(app)
                    .get(`/newPW?newPassword=testpw`)
                    .set("Cookie", cookieJar)
                    .expect({ message: "Password not updated, restart process." })
                    .expect(401, done);
            });
    });
});
