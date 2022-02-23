//setup express
import express from "express";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import pgSimple from "connect-pg-simple";
import request from "supertest";
import db from "../../db/databaseLocalPG.js";
import checkLogin from "./checkLogin.js";
import login from "./login.js";
import sha512 from "./../../db/sha512.js";
import pg from "pg";

const app = express();
dotenv.config();
app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies

var pgPool = new pg.Pool({
    database: process.env.pgdatabase,
    user: process.env.pguser,
    password: process.env.pgpassword,
    port: process.env.pgport,
    ssl: false,
    max: 20, // set pool max size to 20
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
    maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
});

const pgSession = new pgSimple(session);
app.use(
    session({
        // store: new FileStore(fileStoreOptions),
        store: new pgSession({
            pool: pgPool,
        }),
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
    request(app).get("/checkLogin").expect("Content-Type", /json/).expect({ login: 0 }).expect(401).end(done);
});

describe("Get login cookie:", () => {
    let cookieJar = "";
    beforeEach(function (done) {
        request(app)
            .get("/login?email=loginCheck@test.com&pwText=testpw")
            .then((res) => {
                console.log("res", res);
                cookieJar = res.header["set-cookie"];
                done();
            });
    });

    test("Check logged in: get/checkLogin", (done) => {
        request(app)
            .get("/checkLogin")
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
