import express from "express";
import helmet from "helmet";

import eg from "express-graphql";
import dotenv from "dotenv";

import bodyParser from "body-parser";
import path from "path";
import morgan from "morgan"; //request logger middleware.
// import sessionFileStore from "session-file-store";
import { connectPostgres } from "./db/databaseLocalPG.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fileUpload from "express-fileupload";

import { connectMongo } from "./db/mongoLocal.js";

//SETUP ROUTES
import def from "./routes/default.js";
import login from "./routes/loginRoutes/login.js";
import tempLogin from "./routes/loginRoutes/loginTemp.js";
import checkLogin from "./routes/loginRoutes/checkLogin.js";
//accountRegistration
import register from "./routes/accountRegistration/register.js";
import verifyEmail from "./routes/accountRegistration/verifyEmail.js";
//account
import forgot from "./routes/accounts/forgot.js";
import newPW from "./routes/accounts/newPW.js";

import uploadTemplate from "./routes/excelTemplates/uploadTemplate.js";
import runTemplate from "./routes/excelTemplates/runTemplate.js";
import generateTemplate from "./routes/excelTemplates/generateTemplate.js";
import deleteTemplate from "./routes/excelTemplates/deleteTemplate.js";

// import endPoint  from './routes/endPoint.js'
import logUIError from "./routes/logUiError.js";
//routes below re-quire login
import accountData from "./routes/loggedIn/accountData.js";
import dashboard from "./routes/loggedIn/dashboard.js";
import deleeteSavedDashboard from "./routes/loggedIn/deleteSavedDashboard.js";
//mongoDB
import finnHubData from "./routes/mongoDB/finnHubData.js";
import findMongoData from "./routes/mongoDB/findMongoData.js";
import deleteFinnDashData from "./routes/mongoDB/deleteMongoRecords.js";
import updateGQLConfig from "./routes/mongoDB/setMongoConfig.js";
import renameDashboardMongo from "./routes/mongoDB/renameDashboardMongo.js";
import graphQLRedirect from "./routes/graphQL.js";
//graphQL
import { schema } from "./routes/graphQL/graphQL.js";
import Client from "pg";
import session from "express-session";
import pgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

app.use(
    fileUpload({
        createParentPath: true,
        safeFileNames: true,
    })
);

dotenv.config();
const port = process.env.NODE_ENV || 5000;

app.use(morgan("dev"));
app.use(
    bodyParser.json({
        limit: "50mb",
    })
); // support json encoded bodies
app.use(
    bodyParser.urlencoded({
        parameterLimit: 100000,
        limit: "50mb",
        extended: true,
    })
);

app.listen(port, function () {
    console.log(`serving the direcotry @ http`);
});
app.use(express.static(path.join(__dirname, "../../build/"))); //static asset directories are automaticaly served.
connectPostgres(false, app); //if postgres connection fails it retries every 5 seconds.

console.log("Connecting pg", process.env.pguser, process.env.pgport);

const pgPool = new Client.Pool({
    user: process.env.pguser,
    password: process.env.pgpassword,
    host: process.env.pghost,
    port: process.env.pgport,
    database: process.env.pgdatabase,
    ssl: false,
    max: 20, // set pool max size to 20
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
    maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
});

const pgSession = new pgSimple(session);
app.use(
    session({
        store: new pgSession({
            pool: pgPool,
        }),
        secret: process.env.session_secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, sameSite: true },
    })
);
app.use(cookieParser());

connectMongo((err) => {
    if (err & (err !== null)) {
        console.log("2---FAILED TO CONNECT TO MONGODB-----", err);
    }
});

app.use("/", login);
app.use("/", tempLogin);
app.use("/", checkLogin);
//accountRegistration
app.use("/", register);
app.use("/", verifyEmail);
//account
app.use("/", forgot);
app.use("/", newPW);

app.use("/", logUIError);
//loggin
app.use("/", accountData);
app.use("/", dashboard);
app.use("/", deleeteSavedDashboard);
//mongoDB
app.use("/", finnHubData);
app.use("/", findMongoData);
app.use("/", deleteFinnDashData);
app.use("/", updateGQLConfig);
app.use("/", runTemplate);
app.use("/", generateTemplate);
app.use("/", renameDashboardMongo);
app.use("/", graphQLRedirect);
app.use(
    "/graphQL",
    eg.graphqlHTTP({
        schema: schema,
        graphiql: true,
        pretty: true,
    })
);
app.use(
    "/api/graphQL",
    eg.graphqlHTTP({
        schema: schema,
        graphiql: true,
        pretty: true,
    })
);
app.use(
    "/qGraphQL",
    eg.graphqlHTTP({
        schema: schema,
        pretty: true,
    })
);
app.use(
    "/api/qGraphQL",
    eg.graphqlHTTP({
        schema: schema,
        pretty: true,
    })
);
app.use("/", uploadTemplate);
app.use("/", deleteTemplate);
app.use("/", def); // all other routes.

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use((error, req, res, next) => {
    //ALL NEXT
    console.log("Error Handling Middleware@ ", req.path);
    console.error("Error: ", error);
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});
