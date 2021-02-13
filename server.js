
const express = require("express");
require('dotenv').config()
const port = process.env.NODE_ENV || 5000;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const morgan = require('morgan')
app.use(cookieParser());
app.use(bodyParser.json()); // support json encoded bodies
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
app.use(morgan('dev'))

//LOAD CONFIG.
console.log("env=", process.env.live)
if (process.env.live === '1') {
    console.log("loading live server config")
    app.listen(process.env.PORT || port, function () {
      console.log("Listening to http://localhost:" + port);
    })
    app.use(express.static(path.join(__dirname, 'build')));
} else {
    console.log("loading dev server config")
    const path = require("path");
    app.listen(port, function () {console.log(`serving the direcotry @ http`)})
    app.use(express.static(path.join(__dirname, 'build')));

}

//SETUP ROUTES
const login = require('./routes/appLogin')
const appRegister =  require('./routes/registerRoutesPG')
const recover =  require('./routes/recoverAccount')
const endPoint =  require('./routes/endPoint')
const logUIError =  require('./routes/logUiError')
//routes below require login
const accountData = require('./routes/loggedIn/accountData')
const dashboard = require('./routes/loggedIn/dashboard')
const deleeteSavedDashboard = require('./routes/loggedIn/deleteSavedDashboard')

app.use('/', login)    
app.use('/', appRegister)
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
  error.status(404)
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