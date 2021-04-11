//setup express
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import request from 'supertest';
import sessionFileStore from 'session-file-store';
import db from '../../db/databaseLocalPG.js';
import reset from "./reset.js";
import login from "./../loginRoutes/login.js";
const app = express();
dotenv.config();
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
app.use('/', reset); //route to be tested needs to be bound to the router.
app.use('/', login); //needed fo all routes that require login.
beforeAll((done) => {
    const setupDB = `
        INSERT INTO users (
            loginname, email, password,	secretquestion,	
            secretanswer, apikey, webhook, emailconfirmed, 
            resetpasswordlink, exchangelist, defaultexchange, ratelimit
        )
        VALUES (	
            'resetTest',	'resetTest@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
            '69faab6268350295550de7d587bc323d',	'',	'',	true,	
            'testResetLink',	'US',	'US',	30	
        )
        ON CONFLICT
        DO NOTHING
        ;

        UPDATE users 
        SET resetpasswordlink = 'testResetLink'
        WHERE loginname = 'resetTest'
        ;
    `;
    // console.log(setupDB)
    db.connect(err => {
        if (err) {
            console.log('connection error', err.stack);
        }
        else {
            db.query(setupDB, (err) => {
                if (err) {
                    console.log("Problem setting up reset test.");
                }
                done();
            });
        }
    });
});
beforeEach((done) => {
    const setup = ` 
    UPDATE users 
    SET resetpasswordlink = 'testResetLink'
    WHERE loginname = 'resetTest'
    ;`;
    db.query(setup, (err) => {
        if (err) {
            console.log("Problem setting up reset test.");
        }
        done();
    });
});
afterAll((done) => {
    db.end(done());
});
test("Good link get/reset", (done) => {
    request(app)
        .get(`/reset?id=testResetLink&users=resetTest`)
        .expect(302, done);
});
//Missing param data
test("Missing param 1 data get/reset", (done) => {
    request(app)
        .get(`/reset?id=testResetLink`)
        .then(res => {
        expect(res.headers.location).toMatch(`/?message=Problem%25validating%25reset%25link,%25please%25restart%25process.`);
        done();
    });
});
//Missing param data
test("Missing param 2 data get/reset", (done) => {
    request(app)
        .get(`/reset?users=resetTest`)
        .then(res => {
        expect(res.headers.location).toMatch(`/?message=Problem%25validating%25reset%25link,%25please%25restart%25process.`);
        done();
    });
});
//Missing all params
test("Missing param get/reset", (done) => {
    request(app)
        .get(`/reset`)
        .then(res => {
        expect(res.headers.location).toMatch(`/?message=Problem%25validating%25reset%25link,%25please%25restart%25process.`);
        done();
    });
});
//# sourceMappingURL=reset.test.js.map