//setup express
import express from "express";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";
import request from "supertest";
import db from "../../db/databaseLocalPG.js";
import bodyParser from "body-parser";
import newPW from "./newPW.js";
import sha512 from "./../../db/sha512.js";
import login from "./../loginRoutes/login.js";

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

app.use("/", newPW); //route to be tested needs to be bound to the router.
app.use("/", login); //needed fo all routes that require login.

beforeAll((done) => {
    const setupDB = `
    INSERT INTO users (
        email, password,	
        apikey, webhook, confirmemaillink, 
        exchangelist, defaultexchange, ratelimit,
        resetpasswordlink
    )
    VALUES (	
        'newPWTest@test.com', '${sha512("Testpw123!")}',	
        '',	'',	'',	
        'US',	'US',	30,
        'testpasswordlink'
    )
    ON CONFLICT
    DO NOTHING
    ;
    UPDATE users 
    SET resetpasswordlink = 'testpasswordlink', password='${sha512("Testpw123!")}'
    WHERE email = 'newPWTest@test.com'
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

test("Not Logged In", (done) => {
    request(app)
        .post("/api/newPW")
        .send({
            newPassword: "Testpw123!",
        })
        .expect({ message: "Not logged in." })
        .expect(401, done);
});

describe("Get login cookie:", () => {
    let cookieJar = "";
    beforeEach(function (done) {
        request(app)
            .get("/api//login?email=newPWTest@test.com&pwText=Testpw123!")
            .then((res) => {
                cookieJar = res.header["set-cookie"];
                expect(200);
                done();
            });
    });

    test("Set new password get/newPW", (done) => {
        request(app)
            .post("/api/newPW")
            .send({
                newPassword: "NewTestpw1!",
            })
            .set("Cookie", cookieJar)
            .expect({ message: "Password Updated" })
            .expect(200);
        done();
    });

    test("Set new BAD password get/newPW", (done) => {
        request(app)
            .post("/api/newPW")
            .send({
                newPassword: "badpassword",
            })
            .set("Cookie", cookieJar)
            .expect({ message: "Password must be >7 characters, 1 upper, 1 special." })
            .expect(401);
        done();
    });
});
