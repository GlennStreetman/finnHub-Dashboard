const express = require("express");
require('dotenv').config()
const port = process.env.NODE_ENV || 5000;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const bodyParser = require("body-parser");

const app = express();
let fileStoreOptions = {};

if (process.env.live) {
  //enable below to run HTTP server. Used with Heroku
  path = require("path");
  app.listen(process.env.PORT || port, function () {
    console.log("Listening to http://localhost:" + port);
  })
  app.use(cookieParser());
  app.use(bodyParser.json()); // support json encoded bodies
  app.use(express.static(path.join(__dirname, 'build')));
  app.use(
    session({
      store: new FileStore(fileStoreOptions),
      secret: process.env.session_secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, sameSite: true },
    })
  );
} else {
  //used for local testing.  
  //enable below to run HTTPS server. Currently needed when running in dev environment.
  //see the below link for info on updating https info
  //https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
  var fs = require('fs')
  var https = require('https')
  path = require("path");
  https.createServer({
    pfx: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pfx')),
    passphrase: 'glennPSKey',
  }, app).listen(port, function () {
    console.log(`serving the direcotry @ https`)
  })
  app.use(cookieParser());
  app.use(bodyParser.json()); // support json encoded bodies
  app.use(express.static(path.join(__dirname, 'build')));
  app.use(
    session({
      store: new FileStore(fileStoreOptions),
      secret: process.env.session_secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, sameSite: true },
    })
  );
}

//routes
let appRoutes = require('./routes/appRoutes')
let appRegister =  require('./routes/registerRoutes')
app.use('/', appRoutes)
app.use('/', appRegister)