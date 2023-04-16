var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const passport = require("passport");
const config = require("./config");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require("./routes/campsiteRouter");
const promotionRouter = require("./routes/promotionRouter");
const partnerRouter = require("./routes/partnerRouter");
const uploadRouter = require("./routes/uploadRouter");
const favoriteRouter = require("./routes/favoriteRouter");

const mongoose = require("mongoose");

const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(() => console.log("Connected correctly to server"), 
  err => console.log(err)
);

var app = express();

//redirect requests of all type to secure server
app.all("*", (req, res, next) => {
  //req.secure is set by Express to true automatically, if the connection is through HTTPS
  if (req.secure) {
    return next();
  } else {
    console.log(`Redirecting to: https://${req.hostname}:${app.get("secPort")}${req.url}`);
    res.redirect(301, `https://${req.hostname}:${app.get("secPort")}${req.url}`);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//These are only neccessary for session authentication. Two middleware functions provided by passport to check incoming requests to see if there's an existing request for that client, and if so, load the session data for that user (as req.user)
app.use(passport.initialize());
//app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/imageUpload", uploadRouter);

//This is the first middleware function that sends something back to the client, so you want be aware of this vis a vis where you would want authentication middleware
app.use(express.static(path.join(__dirname, 'public')));


app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);
app.use("/favorites", favoriteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
