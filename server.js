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
  console.log("loading live server config")
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

    //live routes, postgres db.
    let appRoutes = require('./routes/postgres/appRoutesPG')
    let appRegister =  require('./routes/postgres/registerRoutesPG')
    app.use('/', appRoutes)
    app.use('/', appRegister)

} else {
  console.log("loading dev server config")
  //remember to updated proxy setting in package.json when switching between http and https
  //used for local testing.  
  //enable below to run HTTPS server.
  //see the below link for info on updating https info
  //https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
  // const fs = require('fs')
  // const https = require('https')
  // path = require("path");
  // https.createServer({
  //   pfx: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pfx')),
  //   passphrase: 'glennPSKey',
  // }, app).listen(port, function () {
  //   console.log(`serving the direcotry @ https`)
  // })

  //enable below to run HTTP server.
  path = require("path");
  app.listen(port, function () {console.log(`serving the direcotry @ http`)})


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

  //dev routes
const appRoutes = process.env.devDB === 'SQL3' ? require('./routes/sqLite3/appRoutesDevSQL3') : require('./routes/postgres/appRoutesPG');
const appRegister = process.env.devDB === 'SQL3' ? require('./routes/sqLite3/registerRoutesSQL3') : require('./routes/postgres/registerRoutesPG') ;
app.use('/', appRoutes)
app.use('/', appRegister)

}