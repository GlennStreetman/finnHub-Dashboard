//setup express
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import request from 'supertest';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import bodyParser from 'body-parser';
import db from '../../db/databaseLocalPG.js';
import cookieParser from 'cookie-parser';
import secretQuestion from './secretQuestion.js';
import login from './../loginRoutes/login.js';
const app = express();
dotenv.config();
// const router = express.Router();
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies
app.use(cookieParser());
const FileStore = sessionFileStore(session);
const fileStoreOptions = {};
app.use(session({
    store: new FileStore(fileStoreOptions),
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true },
}));
app.use('/', secretQuestion); //route to be tested needs to be bound to the router.
app.use('/', login); //needed fo all routes that require login.
beforeAll((done) => {
    const setupDB = `
    INSERT INTO users (
        loginname, email, password,	secretquestion,	
        secretanswer, apikey, webhook, confirmemaillink, 
        resetpasswordlink, exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'secretQuestionTest',	'secretQuestionTest@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
        '69faab6268350295550de7d587bc323d',	'',	'',	'1',	
        '1',	'US',	'US',	30	
    )
    ON CONFLICT
    DO NOTHING
    ;`;
    db.connect();
    db.query(setupDB, (err) => {
        if (err) {
            console.log("verifyEmail beforeAll setup error.");
        }
        else {
            done();
        }
    });
});
afterAll((done) => {
    db.end(done());
});
test("Check correct secret question answer get/secretQuestion", (done) => {
    request(app)
        .get(`/secretQuestion?loginText=goodbye&user=secretQuestionTest`)
        .expect("Content-Type", /json/)
        .expect(200, done);
});
test("Check incorrect secret question answer get/secretQuestion", (done) => {
    request(app)
        .get(`/secretQuestion?loginText=badAnswer&user=secretQuestionTest`)
        .expect("Content-Type", /json/)
        .expect({ message: "Secret question and answer did not match." })
        .expect(401, done);
});
test("Check no secret question answer get/secretQuestion", (done) => {
    request(app)
        .get(`/secretQuestion?loginText=&user=secretQuestionTest`)
        .expect("Content-Type", /json/)
        .expect({ message: "Secret question and answer did not match." })
        .expect(401, done);
});
test("Check not secret question or user get/secretQuestion", (done) => {
    request(app)
        .get(`/secretQuestion?loginText=&user=`)
        .expect("Content-Type", /json/)
        .expect({ message: "Secret question and answer did not match." })
        .expect(401, done);
});
//# sourceMappingURL=secretQuestion.test.js.map