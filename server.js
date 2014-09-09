var express      = require('express');
var app          = express();
var port         = process.env.PORT || 8080;
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB     = require('./config/database.js');

// configuration

mongoose.connect(configDB.url);

// passport for user authentication
require('./config/passport.js')(passport); // pass passport for configuration

app.use(morgan('dev'));  // logs everything to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser());   // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(session({ secret: 'ilovesbigbuttsandicannotlie' }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());            // for flash messages

// ROUTES
require('./app/routes.js')(app, passport);

// launch!
app.listen(port);
console.log('The magic is happening on port: ' + port);

