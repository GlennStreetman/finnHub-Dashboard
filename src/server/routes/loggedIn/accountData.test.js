//setup express
import express from "express";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import request from "supertest";
import sessionFileStore from "session-file-store";
import db from "../../db/databaseLocalPG.js";
import accountData from "./accountData.js";
import login from "./../loginRoutes/login.js";
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

app.use("/", accountData); //route to be tested needs to be bound to the router.
app.use("/", login); //needed fo all routes that require login.

beforeAll((done) => {
    global.sessionStorage = {};

    const setupDB = `
    INSERT INTO users (
        email, password,
        apikey, webhook, emailconfirmed, 
        exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'accountDataTest@test.com',	'${sha512("testpw")}',
        '',	'',	true,	
        'US',	'US',	1	
    )
    , (	
        'accountDataPOSTTest@test.com',	'${sha512("testpw")}',
        '',	'',	true,	
        'US',	'US',	1	
    )
    ON CONFLICT
    DO NOTHING
    `;

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
        .get("/api/accountData")
        .expect("Content-Type", /json/)
        .expect({
            message: "Not logged in.",
        })
        .expect(401, done);
    // .end(done);
});

describe("Get login cookie:", () => {
    //TEST GET ROUTE
    let cookieJar = "";
    beforeEach(function (done) {
        request(app)
            .get("/api/login?email=accountDataTest@test.com&pwText=testpw")
            .then((res) => {
                cookieJar = res.header["set-cookie"];
                expect(200);
                done();
            });
    });

    test("Check get data: get/accountData", (done) => {
        request(app)
            .get("/api/accountData")
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
                request(app).get("/api/logOut");
            })
            .then(() => {
                //check that logging out returns correct result.
                request(app)
                    .get("/api/accountData")
                    .expect("Content-Type", /json/)
                    .expect({
                        message: "Not logged in.",
                    })
                    .expect(401, done);
                // .end(done);
            });
    });
});

describe("Get login cookie POST:", () => {
    //TEST GET ROUTE
    let cookieJar = "";
    beforeAll(function (done) {
        request(app)
            .get("/api/login?email=accountDataPOSTTest@test.com&pwText=testpw")
            .then((res) => {
                cookieJar = res.header["set-cookie"];
                expect(200);
                done();
            });
    });

    test("Check update data, good field: post/accountData", (done) => {
        request(app)
            .post("/api/accountData")
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
});
