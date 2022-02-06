//setup express
import express from "express";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import request from "supertest";
import pgSimple from "connect-pg-simple";
import db from "../../db/databaseLocalPG.js";
import accountData from "./accountData.js";
import login from "./../loginRoutes/login.js";
import sha512 from "./../../db/sha512.js";

const app = express();
dotenv.config();
app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies

const pgSession = new pgSimple(session);
app.use(
    session({
        // store: new FileStore(fileStoreOptions),
        store: new pgSession({
            conString: process.env.authConnString,
        }),
        secret: process.env.session_secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, sameSite: true },
    })
);

app.use("/", accountData); //route to be tested needs to be bound to the router.
app.use("/", login); //needed fo all routes that require login.

beforeAll((done) => {
    global.sessionStorage = {};

    const setupDB = `
    INSERT INTO users (
        email, password,
        apikey, webhook, emailconfirmed, 
        passwordconfirmed, exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'accountDataTest@test.com',	'${sha512("testpw")}',
        '',	'',	true,	
        true,	'US',	'US',	1	
    )
    , (	
        'accountDataPOSTTest@test.com',	'${sha512("testpw")}',
        '',	'',	true,	
        true,	'US',	'US',	1	
    )
    ON CONFLICT
    DO NOTHING
    `;

    console.log(setupDB);

    db.connect();
    db.query(setupDB, (err) => {
        if (err) {
            console.log("accountData setup error.");
        } else {
            done();
        }
    });
});

afterAll((done) => {
    db.end(done());
});

test("Check not logged in: get/accountData", (done) => {
    request(app)
        .get("/accountData")
        .expect("Content-Type", /json/)
        .expect({
            message: "Not logged in.",
        })
        .expect(401)
        .end(done);
});

describe("Get login cookie:", () => {
    //TEST GET ROUTE
    let cookieJar = "";
    beforeEach(function (done) {
        request(app)
            .get("/login?email=accountDataTest@test.com&pwText=testpw")
            .then((res) => {
                cookieJar = res.header["set-cookie"];
                expect(200);
                done();
            });
    });

    test("Check get data: get/accountData", (done) => {
        request(app)
            .get("/accountData")
            .set("Cookie", cookieJar)
            .expect("Content-Type", /json/)
            .expect({
                userData: {
                    email: "accountDataTest@test.com",
                    apikey: "",
                    webhook: "",
                    ratelimit: 1,
                    apialias: null,
                    widgetsetup: "{}",
                },
            })
            .expect(200)
            .then(() => {
                request(app).get("/logOut");
            })
            .then(() => {
                //check that logging out returns correct result.
                request(app)
                    .get("/accountData")
                    .expect("Content-Type", /json/)
                    .expect({
                        message: "Not logged in.",
                    })
                    .expect(401)
                    .end(done);
            });
    });
});

describe("Get login cookie POST:", () => {
    //TEST GET ROUTE
    let cookieJar = "";
    beforeAll(function (done) {
        request(app)
            .get("/login?email=accountDataPOSTTest@test.com&pwText=testpw")
            .then((res) => {
                cookieJar = res.header["set-cookie"];
                expect(200);
                done();
            });
    });

    test("Check update data, good field: post/accountData", (done) => {
        request(app)
            .post("/accountData")
            .send({
                field: "ratelimit",
                newValue: "29",
            })
            .set("Cookie", cookieJar)
            .expect("Content-Type", /json/)
            .expect({
                message: `ratelimit updated`,
                data: "29",
            })
            .expect(200, done);
    });

    test("Check update data, good email post/accountData", (done) => {
        request(app)
            .post("/accountData")
            .send({
                field: "email",
                newValue: "testgoodemail@test.com",
            })
            .set("Cookie", cookieJar)
            .expect("Content-Type", /json/)
            .expect({ message: `Please check email to verify change.` })
            .expect(200, done);
    });

    test("Check update data, bad email post/accountData", (done) => {
        request(app)
            .post("/accountData")
            .send({
                field: "email",
                newValue: "testgoodemailtest.com",
            })
            .set("Cookie", cookieJar)
            .expect("Content-Type", /json/)
            .expect({ message: `email not valid` })
            .expect(401, done);
    });
});
