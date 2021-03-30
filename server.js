import express from "express";

import eg from 'express-graphql'
import g from 'graphql'
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import morgan from 'morgan'; //request logger middleware.
import sessionFileStore  from 'session-file-store';
import dbLive from './db/databaseLive.js';
import devDB from "./db/databaseLocalPG.js"
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import {connectMongo} from "./db/mongoLocal.js"

//SETUP ROUTES
import login  from './routes/loginRoutes/login.js'
import checkLogin  from './routes/loginRoutes/checkLogin.js'
//accountRegistration
import register  from './routes/accountRegistration/register.js'
import secretQuestion   from './routes/accountRegistration/secretQuestion.js'
import verifyEmail  from './routes/accountRegistration/verifyEmail.js'
import verifyChange  from './routes/accountRegistration/verifyChange.js'
//account
import findSecret  from './routes/accounts/findSecret.js'
import forgot  from './routes/accounts/forgot.js'
import newPW  from './routes/accounts/newPW.js'
import reset  from './routes/accounts/reset.js'

// import endPoint  from './routes/endPoint.js'
import logUIError  from './routes/logUiError.js'
//routes below re-quire login
import accountData  from './routes/loggedIn/accountData.js'
import dashboard  from './routes/loggedIn/dashboard.js'
import deleeteSavedDashboard  from './routes/loggedIn/deleteSavedDashboard.js'
//mongoDB
import finnHubData  from './routes/mongoDB/finnHubData.js'
import findMongoData  from './routes/mongoDB/findMongoData.js'
import deleteFinnDashData  from './routes/mongoDB/deleteMongoRecords.js'

const schema = new g.GraphQLSchema({
  query: new g.GraphQLObjectType({
    name: 'helloWorld',
    fields: () => ({
      message: { 
        type: g.GraphQLString,
        resolve: () => 'hello world'
      }
    }),
  })
})

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config()
app.use(cookieParser());
const port = process.env.NODE_ENV || 5000;
const FileStore = sessionFileStore(session)
const fileStoreOptions = {};

app.use(morgan('dev'))
app.use(bodyParser.json({
  limit: 52428800,
})); // support json encoded bodies
app.use(bodyParser.urlencoded({
  parameterLimit: 100000,
  limit: 52428800,
  extended: true
}));

//LOAD CONFIG.
console.log("env=", process.env.live)
if (process.env.live === '1') {
    app.use(
      session({
        store: new FileStore(fileStoreOptions),
        secret: process.env.session_secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, sameSite: true },
      }))
    console.log("loading live server config")
    app.listen(process.env.PORT || port, function () {
      console.log("Listening to http://localhost:" + port);
    })
    app.use(express.static(path.join(__dirname, 'build')));
    const db = dbLive

    db.connect()
      .then(() => console.log("connected to LIVE postgres server"))
      .catch(err => console.log(err))
    connectMongo((err)=>{console.log("Connected", err)})

} else { //development setup
    app.use(
      session({
        store: new FileStore(fileStoreOptions),
        secret: process.env.session_secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, sameSite: true },
      }))
    console.log("loading dev server config")
    // const path  from "path");
    app.listen(port, function () {console.log(`serving the direcotry @ http`)})
    app.use(express.static(path.join(__dirname, 'build')));
    const db = devDB
    db.connect()
      .then(() => console.log("connected to developement postgres server"))
      .catch(err => console.log("ERROR ON PG LOGIN", err))
      connectMongo((err)=>{console.log("Connected", err)})
}

app.use('/', login)
app.use('/', checkLogin)
//accountRegistration
app.use('/', register)
app.use('/', secretQuestion)
app.use('/', verifyEmail)
app.use('/', verifyChange)
//account
app.use('/', findSecret)
app.use('/', forgot)
app.use('/', newPW)
app.use('/', reset)

// app.use('/', endPoint)
app.use('/', logUIError)
//loggin
app.use('/', accountData)
app.use('/', dashboard)
app.use('/', deleeteSavedDashboard)
//mongoDB
app.use('/', finnHubData)
app.use('/', findMongoData)
app.use('/', deleteFinnDashData)
app.use('/graphql', eg.graphqlHTTP({
  schema: schema,
  graphiql: true
}))
app.use((req,res,next) => {
  //ALL OTHER ROUTES
  const error = new Error('PATH Not Found');
  error.status = 404
  console.log(req)
  next(error)
})

app.use((error, req, res, next) => {
  //ALL NEXT
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})