//setup express
import express from "express";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import request from "supertest";
import db from "../../db/databaseLocalPG.js";
import deleteSavedDashboard from "./deleteSavedDashboard.js";
import login from "../loginRoutes/login.js";
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

app.use("/", deleteSavedDashboard); //route to be tested needs to be bound to the router.
app.use("/", login); //needed fo all routes that require login.
let testDash = -1;

beforeAll((done) => {
    global.sessionStorage = {};

    const setupDB = `
    INSERT INTO users (
        email, password,
        apikey, webhook, emailconfirmed, 
        exchangelist, defaultexchange, ratelimit
    )
    VALUES (	
        'accountDeleteDashboardTest@test.com',	'${sha512("testpw")}',
        '',	'',	true,	
        'US',	'US',	30	
    )

    ON CONFLICT
    DO NOTHING
    ;
    INSERT INTO dashboard (
        userid, dashboardname, globalstocklist
    )
    VALUES (
        (SELECT id FROM users WHERE email = 'accountDeleteDashboardTest@test.com'),
        'TEST', 
        '{"US-TSLA":{"currency":"USD","description":"TESLA INC","displaySymbol":"TSLA","figi":"BBG000N9P426","mic":"XNGS","symbol":"TSLA","type":"Common Stock","exchange":"US","key":"US-TSLA"},"US-F":{"currency":"USD","description":"FORD MOTOR CO","displaySymbol":"F","figi":"BBG000BQPFG1","mic":"XNYS","symbol":"F","type":"Common Stock","exchange":"US","key":"US-F"},"US-GM":{"currency":"USD","description":"GENERAL MOTORS CO","displaySymbol":"GM","figi":"BBG0014WFHK6","mic":"XNYS","symbol":"GM","type":"Common Stock","exchange":"US","key":"US-GM"},"US-HNDAF":{"currency":"USD","description":"HONDA MOTOR CO LTD","displaySymbol":"HNDAF","figi":"BBG000G0ZHK3","mic":"OTCM","symbol":"HNDAF","type":"Common Stock","exchange":"US","key":"US-HNDAF"},"US-TM":{"currency":"USD","description":"TOYOTA MOTOR CORP -SPON ADR","displaySymbol":"TM","figi":"BBG000BPH4N9","mic":"XNYS","symbol":"TM","type":"ADR","exchange":"US","key":"US-TM"},"US-PRCH":{"currency":"USD","description":"PORCH GROUP INC","displaySymbol":"PRCH","figi":"BBG00RC9HCX6","mic":"XNCM","symbol":"PRCH","type":"Common Stock","exchange":"US","key":"US-PRCH"},"US-STLA":{"currency":"USD","description":"STELLANTIS NV","displaySymbol":"STLA","figi":"BBG00790SJJ2","mic":"XNYS","symbol":"STLA","type":"Common Stock","exchange":"US","key":"US-STLA"}}'
    )
    ON CONFLICT
    DO NOTHING
 
    ;

    INSERT INTO widgets (
        dashboardkey, 
        columnid, columnorder, filters, 
        trackedstocks, 
        widgetconfig, widgetheader, widgetid, 
        widgettype, xaxis, yaxis
        )
    VALUES (
            (SELECT id FROM dashboard WHERE userid = (SELECT id FROM users where email = 'accountDeleteDashboardTest@test.com') AND dashboardname = 'TEST' )
            , 1 , 0 , '{"startDate":-31449600000,"endDate":0,"Description":"Date numbers are millisecond offset from now. Used for Unix timestamp calculations."}',
            '{"US-TSLA":{"currency":"USD","description":"TESLA INC","displaySymbol":"TSLA","figi":"BBG000N9P426","mic":"XNGS","symbol":"TSLA","type":"Common Stock","exchange":"US","key":"US-TSLA"},"US-F":{"currency":"USD","description":"FORD MOTOR CO","displaySymbol":"F","figi":"BBG000BQPFG1","mic":"XNYS","symbol":"F","type":"Common Stock","exchange":"US","key":"US-F"},"US-GM":{"currency":"USD","description":"GENERAL MOTORS CO","displaySymbol":"GM","figi":"BBG0014WFHK6","mic":"XNYS","symbol":"GM","type":"Common Stock","exchange":"US","key":"US-GM"},"US-HNDAF":{"currency":"USD","description":"HONDA MOTOR CO LTD","displaySymbol":"HNDAF","figi":"BBG000G0ZHK3","mic":"OTCM","symbol":"HNDAF","type":"Common Stock","exchange":"US","key":"US-HNDAF"},"US-TM":{"currency":"USD","description":"TOYOTA MOTOR CORP -SPON ADR","displaySymbol":"TM","figi":"BBG000BPH4N9","mic":"XNYS","symbol":"TM","type":"ADR","exchange":"US","key":"US-TM"},"US-PRCH":{"currency":"USD","description":"PORCH GROUP INC","displaySymbol":"PRCH","figi":"BBG00RC9HCX6","mic":"XNCM","symbol":"PRCH","type":"Common Stock","exchange":"US","key":"US-PRCH"},"US-STLA":{"currency":"USD","description":"STELLANTIS NV","displaySymbol":"STLA","figi":"BBG00790SJJ2","mic":"XNYS","symbol":"STLA","type":"Common Stock","exchange":"US","key":"US-STLA"}}',
            'stockWidget', 'Earnings Calendar: ',  '1614017865836', 
            'EstimatesEarningsCalendar', 375, 71

        )
        ,(
            (SELECT id FROM dashboard WHERE userid = (SELECT id FROM users where email = 'accountDeleteDashboardTest@test.com') AND dashboardname = 'TEST' )
            ,1,2,'{}',
            '{"US-TSLA":{"currency":"USD","description":"TESLA INC","displaySymbol":"TSLA","figi":"BBG000N9P426","mic":"XNGS","symbol":"TSLA","type":"Common Stock","exchange":"US","key":"US-TSLA"},"US-F":{"currency":"USD","description":"FORD MOTOR CO","displaySymbol":"F","figi":"BBG000BQPFG1","mic":"XNYS","symbol":"F","type":"Common Stock","exchange":"US","key":"US-F"},"US-GM":{"currency":"USD","description":"GENERAL MOTORS CO","displaySymbol":"GM","figi":"BBG0014WFHK6","mic":"XNYS","symbol":"GM","type":"Common Stock","exchange":"US","key":"US-GM"},"US-HNDAF":{"currency":"USD","description":"HONDA MOTOR CO LTD","displaySymbol":"HNDAF","figi":"BBG000G0ZHK3","mic":"OTCM","symbol":"HNDAF","type":"Common Stock","exchange":"US","key":"US-HNDAF"},"US-TM":{"currency":"USD","description":"TOYOTA MOTOR CORP -SPON ADR","displaySymbol":"TM","figi":"BBG000BPH4N9","mic":"XNYS","symbol":"TM","type":"ADR","exchange":"US","key":"US-TM"},"US-PRCH":{"currency":"USD","description":"PORCH GROUP INC","displaySymbol":"PRCH","figi":"BBG00RC9HCX6","mic":"XNCM","symbol":"PRCH","type":"Common Stock","exchange":"US","key":"US-PRCH"},"US-STLA":{"currency":"USD","description":"STELLANTIS NV","displaySymbol":"STLA","figi":"BBG00790SJJ2","mic":"XNYS","symbol":"STLA","type":"Common Stock","exchange":"US","key":"US-STLA"}}',
            'stockWidget', 'EPS Surprises: ', '1614017869054', 'EstimatesEPSSurprises', 440, 155
        )
    ON CONFLICT
    DO NOTHING
    ;
    INSERT INTO menusetup (
        userid, defaultmenu
    )
    VALUES(
        (SELECT id FROM users WHERE email = 'accountDeleteDashboardTest@test.com'),
        'TEST'
    )
    ON CONFLICT
    DO NOTHING
    ;
    INSERT INTO menus (
        menukey, 
        columnid, columnorder, widgetconfig, widgetheader, widgetid, 
        widgettype, xaxis, yaxis
    )
    VALUES (
        (SELECT id FROM menuSetup WHERE userid = (SELECT id FROM users WHERE email = 'accountDeleteDashboardTest@test.com')),
        0,-1,'menuWidget', 'saved Dashboards', 'DashBoardMenu',
        'DashBoardMenu','5rem', '5rem'
        ),
        ((SELECT id FROM menuSetup WHERE userid = (SELECT id FROM users WHERE email = 'accountDeleteDashboardTest@test.com')),
        0,-1,'menuWidget', 'WatchList', 'WatchListMenu',
        'WatchListMenu','5rem', '5rem')
    
    ON CONFLICT
    DO NOTHING
    ;
    SELECT id FROM dashboard 
    WHERE userid = (SELECT id FROM users where email = 'accountDeleteDashboardTest@test.com') 
        AND dashboardname = 'TEST'
    `;
    // console.log(setupDB)
    db.connect();
    db.query(setupDB, (err, res) => {
        if (err) {
            console.log("accountData setup error.");
        } else {
            testDash = res[5].rows[0].id;
            console.log(testDash);
            done();
        }
    });
});

afterAll((done) => {
    db.end(done());
});

test("Check not logged in: get/deleteSavedDashboard", (done) => {
    request(app)
        .get("/api/deleteSavedDashboard")
        .expect("Content-Type", /json/)
        .expect({
            message: "Not logged in.",
        })
        .expect(401, done);
});

describe("Get login cookie:", () => {
    //TEST GET ROUTE
    let cookieJar = "";
    beforeEach(function (done) {
        request(app)
            .get("/api/login?email=accountDeleteDashboardTest@test.com&pwText=testpw")
            .then((res) => {
                cookieJar = res.header["set-cookie"];
                expect(200);
                done();
            });
    });

    test("Success delete dashboard get/deleteSavedDashboard", (done) => {
        request(app)
            .get(`/api/deleteSavedDashboard?dashID=${testDash}`)
            .set("Cookie", cookieJar)
            .expect("Content-Type", /json/)
            .expect({ message: "Dashboard deleted" })
            .expect(200)
            .then(() => {
                request(app)
                    .get("/api/logOut")
                    .set("Cookie", cookieJar)
                    .expect({ message: "Logged Out" })
                    .expect(200)
                    .then(() => {
                        request(app)
                            .get(`/api/deleteSavedDashboard?dashID=${testDash}`)
                            .set("Cookie", cookieJar)
                            // .expect("Content-Type", /json/)
                            .expect({
                                message: "Not logged in.",
                            })
                            .expect(401, done);
                    });
            });
    });
});
