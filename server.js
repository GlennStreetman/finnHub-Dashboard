
const express = require("express");
const app = express();
require('dotenv').config()
const port = process.env.NODE_ENV || 5000;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const morgan = require('morgan') //request logger middleware.
app.use(cookieParser());
const FileStore = require("session-file-store")(session);
const fileStoreOptions = {};

app.use(morgan('dev'))
app.use(bodyParser.json()); // support json encoded bodies

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
    const db = require("./db/databaseLive.js") 

    db.connect()
      .then(() => console.log("connected to developement postgres server"))
      .catch(err => console.log(err))

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
    const path = require("path");
    app.listen(port, function () {console.log(`serving the direcotry @ http`)})
    app.use(express.static(path.join(__dirname, 'build')));
    const db = require("./db/databaseLocalPG.js")
    const mongo = require('./db/mongoLocal.js') 


    db.connect()
      .then(() => console.log("connected to developement postgres server"))
      .catch(err => console.log(err))
}

//SETUP ROUTES
const login = require('./routes/loginRoutes/login')
const checkLogin = require('./routes/loginRoutes/checkLogin')
//accountRegistration
const register =  require('./routes/accountRegistration/register')
const secretQuestion =  require('./routes/accountRegistration/secretQuestion')
const verifyEmail =  require('./routes/accountRegistration/verifyEmail')
const verifyChange =  require('./routes/accountRegistration/verifyChange')
//account
const findSecret =  require('./routes/accounts/findSecret')
const forgot =  require('./routes/accounts/forgot')
const newPW =  require('./routes/accounts/newPW')
const reset =  require('./routes/accounts/reset')

const endPoint =  require('./routes/endPoint')
const logUIError =  require('./routes/logUiError')
//routes below require login
const accountData = require('./routes/loggedIn/accountData')
const dashboard = require('./routes/loggedIn/dashboard')
const deleeteSavedDashboard = require('./routes/loggedIn/deleteSavedDashboard')
//mongoDB
const postFinnHubData = require('./routes/mongoDB/postFinnHubData')

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

app.use('/', endPoint)
app.use('/', logUIError)
//loggin
app.use('/', accountData)
app.use('/', dashboard)
app.use('/', deleeteSavedDashboard)
//mongoDB
app.use('/', postFinnHubData)
app.use((req,res,next) => {
  //ALL OTHER ROUTES
  const error = new Error('PATH Not Found');
  error.status = 404
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