
const express = require("express");
const app = express();
require('dotenv').config()
const port = process.env.NODE_ENV || 5000;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
const path = require("path");
const morgan = require('morgan') //request logger middleware.
app.use(cookieParser());
const FileStore = require("session-file-store")(session);
const fileStoreOptions = {};

app.use(morgan('dev'))

//LOAD CONFIG.
console.log("env=", process.env.live)
if (process.env.live === '1') {
    app.use(
      session({
        store: new FileStore(fileStoreOptions),
        secret: process.env.session_secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true, sameSite: true },
      }))
    console.log("loading live server config")
    app.listen(process.env.PORT || port, function () {
      console.log("Listening to http://localhost:" + port);
    })
    app.use(express.static(path.join(__dirname, 'build')));
    const db = require("../db/databaseLive.js") 

    db.connect()
      .then(() => console.log("connected to developement postgres server"))
      .catch(err => console.log(err))

} else {
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

    db.connect()
      .then(() => console.log("connected to developement postgres server"))
      .catch(err => console.log(err))
}

//SETUP ROUTES
const login = require('./routes/loginRoutes/login')
const checkLogin = require('./routes/loginRoutes/checkLogin')

const register =  require('./routes/accountRegistration/register')
const secretQuestion =  require('./routes/accountRegistration/secretQuestion')
const verifyEmail =  require('./routes/accountRegistration/verifyEmail')
const verifyChange =  require('./routes/accountRegistration/verifyChange')

const recover =  require('./routes/recoverAccount')
const endPoint =  require('./routes/endPoint')
const logUIError =  require('./routes/logUiError')
//routes below require login
const accountData = require('./routes/loggedIn/accountData')
const dashboard = require('./routes/loggedIn/dashboard')
const deleeteSavedDashboard = require('./routes/loggedIn/deleteSavedDashboard')

app.use('/', login)
app.use('/', checkLogin)

app.use('/', register)
app.use('/', secretQuestion)
app.use('/', verifyEmail)
app.use('/', verifyChange)

app.use('/', endPoint)
app.use('/', recover)
app.use('/', logUIError)
//loggin
app.use('/', accountData)
app.use('/', dashboard)
app.use('/', deleeteSavedDashboard)
app.use((req,res,next) => {
  //ALL OTHER ROUTES
  const error = new Error('Not Found');
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