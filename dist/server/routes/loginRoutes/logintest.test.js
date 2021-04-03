const request = require("supertest");
import express from 'express';
const app = express();
require('dotenv').config();
import path from 'path';
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.urlencoded({ extended: false }));
import bodyParser from 'body-parser';
app.use(bodyParser.json()); // support json encoded bodies
import cookieParser from 'cookie-parser';
app.use(cookieParser());
import session from 'express-session';
const FileStore = require("session-file-store")(session);
const fileStoreOptions = {};
app.use(session({
    store: new FileStore(fileStoreOptions),
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true },
}));
const login = require("./login.js");
const db = require("../../db/databaseLocalPG.js");
app.use('/', login); //route to be tested needs to be bound to the router.
beforeAll((done) => {
    global.sessionStorage = {};
    const setupDB = `
    INSERT INTO users (
        loginname, email, password,	secretquestion,	
        secretanswer, apikey, webhook, emailconfirmed, 
        passwordconfirmed, exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'loginTest',	'loginTest@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
        '69faab6268350295550de7d587bc323d',	'',	'',	'1',	
        '1',	'US',	'US',	30	
    )
    ON CONFLICT
    DO NOTHING
    ;

    INSERT INTO users (
        loginname, email, password,	secretquestion,	
        secretanswer, apikey, webhook, emailconfirmed, 
        passwordconfirmed, exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'loginTest_notVerified',	'loginTest_notVerified.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
        '69faab6268350295550de7d587bc323d',	'',	'',	'0',	
        '1',	'US',	'US',	30	
    )
    ON CONFLICT
    DO NOTHING
    ;

    UPDATE users 
    SET confirmemaillink = '071e3afe81e12ff2cebcd41164a7a295', emailconfirmed = '0'
    WHERE loginname = 'verifyEmailTest';
    `;
    // console.log(setupDB)
    db.connect();
    db.query(setupDB, (err) => {
        if (err) {
            console.log("verifyEmail beforeAll setup error.");
        }
        else {
            console.log("verifyEmail db setup success");
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
        .get("/login?loginText=loginTest&pwText=testpw")
        .expect("Content-Type", /json/)
        .expect({
        key: "",
        login: 1,
        ratelimit: 30,
        response: 'success',
        exchangelist: 'US',
        defaultexchange: 'US',
    })
        .expect(200, done);
});
//bad user name
test("Wrong login name get/login", (done) => {
    request(app)
        .get("/login?loginText=badUserName&pwText=testpw")
        .expect("Content-Type", /json/)
        .expect({
        message: 'Login and Password did not match.',
    })
        .expect(401, done);
});
//bad pw
test("Wrong pw get/login", (done) => {
    request(app)
        .get("/login?loginText=loginTest&pwText=badPw")
        .expect("Content-Type", /json/)
        .expect({
        message: 'Login and Password did not match.',
    })
        .expect(401, done);
});
//missing paramaters.
test("Missing paramaters get/login", (done) => {
    request(app)
        .get("/login?loginText=&pwText=")
        .expect("Content-Type", /json/)
        .expect({
        message: 'Login and Password did not match.',
    })
        .expect(401, done);
});
//confirm email.
test("Email not confirmed get/login", (done) => {
    request(app)
        .get("/login?loginText=loginTest_notVerified&pwText=testpw")
        .expect("Content-Type", /json/)
        .expect({
        message: 'Email not confirmed. Please check email for confirmation message.',
    })
        .expect(401, done);
});
// bad data
test("Check missing paramaters get/login", (done) => {
    request(app)
        .get("/login?loginText=SELECT%*%FROM%USERS&pwText=")
        .expect("Content-Type", /json/)
        .expect({
        message: 'Login and Password did not match.',
    })
        .expect(401, done);
});
//# sourceMappingURL=logintest.test.js.map