"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const cookies     = require('cookie-session');
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const linksRoutes = require("./routes/links");
const linkRoutes = require("./routes/home");
const ratingsRoutes = require("./routes/ratings");
const boardsRoutes = require("./routes/boards");
const topicsRoutes = require("./routes/topics");
const likesRoutes = require("./routes/likes");
const commentsRoutes = require("./routes/comments");
const usersboardRoutes = require("./routes/users_boards");
const profileRoutes = require("./routes/profile");
const boards = require("./routes/boards");

// Encrypting user sessions
app.use(cookies({
  name: "session",
  keys: ["secretkey"]
}));

// Generates 8 digit unique id
function generateRandomString() {
  let shortLink = Math.random().toString(36).substr(2, 8);
  return shortLink;
};

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));
app.use("/api/links", linkRoutes(knex));
app.use("/api/ratings", ratingsRoutes(knex));
app.use("/api/boards", boardsRoutes(knex));
app.use("/api/topics", topicsRoutes(knex));
app.use("/api/likes", likesRoutes(knex));
app.use("/api/comments", commentsRoutes(knex));
app.use("/api/userboards", usersboardRoutes(knex));
app.use("/users", profileRoutes(knex));
app.use("/links", linksRoutes(knex));
app.use("/boards", boards(knex));

// Home page
app.get("/", (req, res) => {
  if (req.session.userid) {
    knex
    .select('*')
      .from('users')
      .where('id', req.session.userid)
      .then((userInfo) => {
        let templateVars = userInfo[0];
        return res.render('index', templateVars);
      });
  } else {
    let templateVars = { id: req.session.userid };
    res.render('index', templateVars);
  }
});


// Account Page
app.get("/users/:userid", (req, res) => {
  knex
    .select('*')
    .from('users')
    .where('id', req.session.userid)
    .then(function(results){
    let users = results[0];
    console.log(results);
    res.render('account_page', {
      full_name: users.full_name,
      user_avatar: users.avatar,
      email: users.email,
      id: req.session.userid,
      username: users.username,
    });
  });
});

// USER PROFILE
app.get("/users/:username/profile", (req, res) => {
  knex
    .select('id', 'full_name', 'username', 'email', 'avatar')
    .from('users')
    .where('id', req.session.userid)
    .then((userInfo) => {
      let templateVars = userInfo[0];
      res.render('user_profile', templateVars);
    });
});

// Update User Profile
app.post('/users/:username/profile/update', (req, res) => {
  knex('users')
    .where({id: req.session.userid})
    .update({full_name: req.body.fullName, email: req.body.email, password: req.body.password})
    .then((results)=>{
      return res.redirect(`/users/${req.body.username}/profile`);
    });
});


// Login
app.post("/login", (req, res) => {
  knex
  .select("*")
    .from("users")
    .then((results) => {
      for (let i = 0; i < results.length; i++) {
        if (req.body.username === results[i].username && req.body.password === results[i].password) {
          req.session.userid = results[i].id;
          console.log("MATCH");
          return res.redirect("/");
        }
      }
      return res.status(403).send("HTTP 403 - NOT FOUND: USERNAME OR PW INCORRECT!").end();
    });
});

// Register
app.post("/register", (req, res) => {
  knex
  .select("*")
    .from("users")
    .then((results) => {
      for(let i = 0;i < results.length;i++) {
        if (req.body.email === results[i].email) {
          return res.status(400).send("HTTP 400 - BAD REQUEST: E-MAIL ALREADY USED!").end();
        } else if (req.body.username === results[i].username) {
          return res.status(400).send("HTTP 400 - BAD REQUEST: USERNAME ALREADY USED!").end();
        }
      }
      knex("users")
        .insert({full_name: req.body.fullName, username: req.body.username, email: req.body.email, password: req.body.password, avatar: `https://avatars.dicebear.com/v2/avataaars/${req.body.username}.svg`})
        .then(() => {
          knex.select('id')
            .from('users')
            .where('username', req.body.username)
            .then((results) => {
              req.session.userid = results[0].id;
              res.redirect('/');
            });
        });
    });
});

// Clears cookies upon logging out
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
