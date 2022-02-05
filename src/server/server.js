import express from "express";
import helmet from "helmet";

import eg from "express-graphql";
import dotenv from "dotenv";

import session from "express-session";
import pgSimple from "connect-pg-simple";

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
import checkLogin from "./routes/loginRoutes/checkLogin.js";
//accountRegistration
import register from "./routes/accountRegistration/register.js";
import secretQuestion from "./routes/accountRegistration/secretQuestion.js";
import verifyEmail from "./routes/accountRegistration/verifyEmail.js";
import verifyChange from "./routes/accountRegistration/verifyChange.js";
//account
import findSecret from "./routes/accounts/findSecret.js";
import forgot from "./routes/accounts/forgot.js";
import newPW from "./routes/accounts/newPW.js";
import reset from "./routes/accounts/reset.js";

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

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

if (process.env.echo) console.log(process.env.echo);

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
        limit: 52428800,
    })
); // support json encoded bodies
app.use(
    bodyParser.urlencoded({
        parameterLimit: 100000,
        limit: 52428800,
        extended: true,
    })
);
console.log("creating postgress session");
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

app.listen(port, function () {
    console.log(`serving the direcotry @ http`);
});
console.log("dev path ", path.join(__dirname, "../../build/"));
app.use(express.static(path.join(__dirname, "../../build/"))); //static asset directories are automaticaly served.
console.log("connecting to postgres");
connectPostgres(); //if postgres connection fails it retries every 5 seconds.
connectMongo((err) => {
    if (err & (err !== null)) {
        console.log("2---FAILED TO CONNECT TO MONGODB-----", err);
    }
});

app.use("/", login);
app.use("/", checkLogin);
//accountRegistration
app.use("/", register);
app.use("/", secretQuestion);
app.use("/", verifyEmail);
app.use("/", verifyChange);
//account
app.use("/", findSecret);
app.use("/", forgot);
app.use("/", newPW);
app.use("/", reset);

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
    "/graphql",
    eg.graphqlHTTP({
        schema: schema,
        graphiql: true,
        pretty: true,
    })
);
app.use(
    "/qGraphql",
    eg.graphqlHTTP({
        schema: schema,
        pretty: true,
    })
);
app.use("/", uploadTemplate);
app.use("/", deleteTemplate);
app.use("/", def);

app.use((req, res, next) => {
    //ALL OTHER ROUTES
    const error = new Error("PATH Not Found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    //ALL NEXT
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});
