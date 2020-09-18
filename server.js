const express = require("express");
const path = require("path");
const port = process.env.NODE_ENV || 5000;
const md5 = require("md5");
var db = require("./database.js");

// const session = require("express-session");
// const { v4: uuidv4 } = require("uuid");
// const FileStore = require("session-file-store")(session);
// const bodyParser = require("body-parser");
// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const axios = require("axios");

const app = express();

//build required in order to render react. Always place after session definition.
app.use(express.static(path.join(__dirname, "/build")));

app.get("/", (req, res) => {
  // if (req.isAuthenticated()) {
  res.sendFile(__dirname + "/public/");
  // } else {
  //   res.sendFile(__dirname + "/public/");
  // }
});

// create the login get and post routes
app.get("/login", (req, res) => {
  // console.log("Login Running");
  thisRequest = req.query;
  newQuery = "SELECT apiKey FROM user WHERE name ='" + thisRequest["loginText"] + "' AND password = '" + md5(thisRequest["pwText"]) + "'";
  // console.log(newQuery);
  let myKey = { key: "", login: 0 };
  db.all(newQuery, [], (err, rows) => {
    if (err) {
      res.json(myKey);
    }
    rows.forEach((row) => {
      myKey["key"] = row.apiKey;
      myKey["login"] = 1;
      // console.log(myKey);
    });
    res.json(myKey);
  });
  // console.log(req.query);

  // console.log(req.sessionID);
  // res.sendFile(__dirname + "/public/");
  // res.send(`You got the login page!\n`);
});

app.listen(port, function () {
  console.log("Listening to http://localhost:" + port);
});

// Default response for any other request
app.use(function (req, res) {
  res.status(404);
});

// configure passport.js to use the local strategy
// passport.use(
//   new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
//     axios
//       .get(`http://localhost:5000/users?email=${email}`)
//       .then((res) => {
//         const user = res.data[0];
//         if (!user) {
//           return done(null, false, { message: "Invalid credentials.\n" });
//         }
//         if (password != user.password) {
//           return done(null, false, { message: "Invalid credentials.\n" });
//         }
//         return done(null, user);
//       })
//       .catch((error) => done(error));
//   })
// );

// // tell passport how to serialize the user
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   axios
//     .get(`http://localhost:5000/users/${id}`)
//     .then((res) => done(null, res.data))
//     .catch((error) => done(error, false));
// });

// // add & configure middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(
//   session({
//     genid: (req) => {
//       console.log("Inside the session middleware");
//       console.log(req.genid);
//       return uuidv4(); // use UUIDs for session IDs
//     },
//     store: new FileStore(),
//     secret: "keyboard cat",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false },
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// app.post("/", (req, res, next) => {
//   console.log("Inside POST /login callback");
//   passport.authenticate("local", (err, user, info) => {
//     console.log("Inside passport.authenticate() callback");
//     console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`);
//     console.log(`req.user: ${JSON.stringify(req.user)}`);
//     req.login(user, (err) => {
//       console.log("Inside req.login() callback");
//       console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`);
//       console.log(`req.user: ${JSON.stringify(req.user)}`);
//       return res.send("You were authenticated & logged in!\n");
//     });
//   })(req, res, next);
// });
