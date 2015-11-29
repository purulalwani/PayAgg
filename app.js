var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
        });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                       message: err.message,
                       error: err
                       });
            });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
                   message: err.message,
                   error: {}
                   });
        });


module.exports = app;


// Open mongo DB connection

var mongoose = require('mongoose');
var passport = require('passport');

var Post = require('./models/Posts');
var Comment = require('./models/Comments');
var User = require('./models/Users');
var Item = require('./models/Items');
var Preference = require('./models/PaymentPreference');
require('./config/passport');



app.use(passport.initialize());



//provide a sensible default for local development
mongodb_connection_string = 'mongodb://127.0.0.1:27017/' + 'news';
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
    mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME;
}




//mongoose.connect('mongodb://localhost/news', function(err) {
mongoose.connect(mongodb_connection_string, function(err) {
                 if(err) {
                 console.log('DB connection error', err);
                 } else {
                 console.log('DB connection successful');
                 }
                 });




//mongoose.connect('mongodb://localhost/news');