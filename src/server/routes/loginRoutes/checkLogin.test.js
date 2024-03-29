//setup express
import express from "express";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import request from "supertest";
import db from "../../db/databaseLocalPG.js";
import checkLogin from "./checkLogin.js";
import login from "./login.js";
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

app.use("/", checkLogin); //route to be tested needs to be bound to the router.
app.use("/", login); //needed for all routes that require login.

beforeAll((done) => {
    global.sessionStorage = {};

    const setupDB = `
    INSERT INTO users (
        email, password,
        apikey, webhook, emailconfirmed, 
        exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'loginCheck@test.com',	'${sha512("testpw")}',
        '',	'',	'1',	
        'US',	'US',	1	
    )
    ON CONFLICT
    DO NOTHING
    ;`;

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

test("Check logged out: get/checkLogin", (done) => {
    request(app).get("/api/checkLogin").expect("Content-Type", /json/).expect({ login: 0 }).expect(401).end(done);
});

describe("Get login cookie:", () => {
    let cookieJar = "";
    beforeEach(function (done) {
        request(app)
            .get("/api/login?email=loginCheck@test.com&pwText=testpw")
            .then((res) => {
                // console.log("res", res);
                cookieJar = res.header["set-cookie"];
                done();
            });
    });

    test("Check logged in: get/checkLogin", (done) => {
        request(app)
            .get("/api/checkLogin")
            .set("Cookie", cookieJar)
            .expect("Content-Type", /json/)
            .expect({
                login: 1,
                apiKey: "",
                apiAlias: null,
                exchangelist: "US",
                defaultexchange: "US",
                ratelimit: 1,
                widgetsetup: "{}",
            })
            .expect(200)
            .end(done);
    });
});
