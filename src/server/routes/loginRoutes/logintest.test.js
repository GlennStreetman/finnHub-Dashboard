import request from "supertest";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import login from "./login.js";
import db from "../../db/databaseLocalPG.js";
import sha512 from "./../../db/sha512.js";

import sessionFileStore from "session-file-store";

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

app.use("/", login); //route to be tested needs to be bound to the router.

beforeAll((done) => {
    global.sessionStorage = {};
    const setupDB = `
    INSERT INTO users (
        email, password, 
        apikey, webhook, emailconfirmed, 
        exchangelist, defaultexchange, ratelimit,
        widgetsetup, apialias
    )
    VALUES (	
        'loginTest@test.com', '${sha512("testpw")}',
        '',	'',	true, 
        'US',	'US',	1,
        '{"PriceSplits":false}',
        'testalias'	
    )
    ON CONFLICT
    DO NOTHING
    ;

    INSERT INTO users (
        email, password,	
        apikey, webhook, emailconfirmed, 
        exchangelist, defaultexchange, ratelimit,
        widgetsetup, apialias
    )
    VALUES (	
        'loginTest_notVerified.com', '${sha512("testpw")}',
        '',	'',	false,	
        'US',	'US',	1, 
        '{"PriceSplits":false}',
        'testAlias2'
    )
    ON CONFLICT
    DO NOTHING
    ;

    `;
    console.log(setupDB);
    db.connect();
    db.query(setupDB, (err) => {
        if (err) {
            console.log("verifyEmail beforeAll setup error.");
            done();
        } else {
            done();
        }
    });
});

afterAll((done) => {
    db.end(done);
});

//good login
test("Good login get/login", (done) => {
    request(app)
        .get("/api/login?email=loginTest@test.com&pwText=testpw")
        .expect("Content-Type", /json/)
        .expect({
            key: "",
            login: 1,
            ratelimit: 1,
            response: "success",
            exchangelist: "US",
            defaultexchange: "US",
            widgetsetup: '{"PriceSplits":false}',
            apiAlias: "testalias",
        })
        .expect(200, done);
});
//bad user name
test("Wrong login name get/login", (done) => {
    request(app)
        .get("/api/login?email=badUserName@bad.com&pwText=testpw")
        .expect("Content-Type", /json/)
        .expect({
            message: "Login and Password did not match.",
        })
        .expect(401, done);
});

//bad pw
test("Wrong pw get/login", (done) => {
    request(app)
        .get("/api/login?email=loginTest@test.com&pwText=badPw")
        .expect("Content-Type", /json/)
        .expect({
            message: "Login and Password did not match.",
        })
        .expect(401, done);
});

//missing paramaters.
test("Missing paramaters get/login", (done) => {
    request(app)
        .get("/api/login?email=&pwText=")
        .expect("Content-Type", /json/)
        .expect({
            message: "Login and Password did not match.",
        })
        .expect(401, done);
});

//confirm email.
test("Email not confirmed get/login", (done) => {
    request(app)
        .get("/api/login?email=loginTest_notVerified.com&pwText=testpw")
        .expect("Content-Type", /json/)
        .expect({
            message: "Email not confirmed. Please check email for confirmation message.",
        })
        .expect(401, done);
});

// bad data
test("Check missing paramaters get/login", (done) => {
    request(app)
        .get("/api/login?email=SELECT%*%FROM%USERS&pwText=")
        .expect("Content-Type", /json/)
        .expect({
            message: "Login and Password did not match.",
        })
        .expect(401, done);
});
