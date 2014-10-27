// config/passport.js

// load all the things we need

var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
// load the user model

var User             = require('../app/models/user');

// load the auth variables

var configAuth = require('./auth');

// expose this function to our app using module.exports

module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

  // =========================================================================
  // GOOGLE+ ================================================================
  // =========================================================================

  passport.use(new GoogleStrategy({

    // pull in our client key and client secret from auth.js file
    clientID     : configAuth.googleAuth.clientID,
    clientSecret : configAuth.googleAuth.clientSecret,
    callbackURL  : configAuth.googleAuth.callbackURL,
    passReqToCallback : true

  },
  function(req, token, refreshToken, profile, done) {
    // asynch
    process.nextTick(function() {
      // find the user in the database with google id
      if (!req.user) {
        User.findOne({ 'google.id' : profile.id }, function(err, user) {
          if (err)
            return done(err);
          if (user) {
            
            if (!user.google.token) {
              user.google.token = token;
              user.google.id    = profile.id;
              user.google.name  = profile.displayName;
              user.google.email = profile.emails[0].value;

              user.save(function(err) {
                if (err)
                  throw err;
                return done(null, user);
              });
            }
            // if a user is found log them in
            return done(null, user);
          
          } else {
            // if the user isnt set in our database, create them
            var newUser = new User();

            // set all of the relevant information
            newUser.google.id       = profile.id;
            newUser.google.token    = token;
            newUser.google.name     = profile.displayName;
            newUser.google.email    = profile.emails[0].value; // pull the first email

            // saving the user
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });

          }

        });

      } else {
        
        var user = req.user;

        user.google.id    = profile.id;
        user.google.token = token;
        user.google.name  = profile.displayName;
        user.google.email = profile.emails[0].value;

        user.save(function(err) {
          if (err)
            throw err;
          return done(null, user);
        });
      }
    });
  }));


  // =========================================================================
  // TWITTER ================================================================
  // =========================================================================

  passport.use(new TwitterStrategy({

    // pull in our api key and secret key from auth.js file
    consumerKey    : configAuth.twitterAuth.consumerKey,
    consumerSecret : configAuth.twitterAuth.consumerSecret,
    callbackURL    : configAuth.twitterAuth.callbackURL,
    passReqToCallback : true 

  },
  function(req, token, tokenSecret, profile, done) {
    // making the code asynchronous
    // User.findOne wont fire until we get all of our data back from Twitter
    process.nextTick(function(){
      if (!req.user) {
      // find the user in the database based on their twitter.id
        User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

          // if there is an error stop the presses
          if (err)
            return done(err);
          // if there is a user found log them in
          if (user) {
            if (!user.twitter.token) {
              user.twitter.token       = token;
              user.twitter.id          = profile.id;
              user.twitter.username    = profile.username;
              user.twitter.displayName = profile.displayName;

              user.save(function(err) {
                if (err)
                  throw err;
                return done(null, user);
              });
            }
            return done(null, user);
          } else {
            // if there is no user, create them
            var newUser = new User();

            // set all of the user data that we need
            newUser.twitter.id          = profile.id;
            newUser.twitter.token       = token;
            newUser.twitter.username    = profile.username;
            newUser.twitter.displayName = profile.displayName;

            // save our user
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }
        });
      } else {
        // if the user exists then we link their account
        var user = req.user; // pulls the user out of the session

        user.twitter.id          = profile.id;
        user.twitter.token       = token;
        user.twitter.username    = profile.username;
        user.twitter.displayName = profile.displayName;

        user.save(function(err) {
          if (err)
            throw err;
          return done(null, user);
        });
      }
    });
  }));

  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================

  passport.use(new FacebookStrategy({

    // pull in our app id and secret key from our auth.js file
    clientID     : configAuth.facebookAuth.clientID,
    clientSecret : configAuth.facebookAuth.clientSecret,
    callbackURL  : configAuth.facebookAuth.callbackURL,
    passReqToCallback : true // allows us to pass in the req from our route (to check if a user is logged in or not)
  },

  // facebook will send back the token and profile
  function(req, token, refreshToken, profile, done) {

    // asynchronous
    process.nextTick(function() {
      // check if the user is logged in
      if (!req.user) {
        // find the user in the database based on their facebook id
        User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
          // if there is an error stop everything and return that
          // ie an error connecting to the db
          if (err)
            return done(err);

          // if the user is found, then log them in
          if (user) {
            
            // if there is a user id already but no token (the user was linked but then unlinked)
            // just add our token and update profile information

            if (!user.facebook.token) {
              user.facebook.token = token;
              user.facebook.id    = profile.id;
              user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
              user.facebook.email = profile.emails[0].value;

              user.save(function(err) {
                if (err)
                  throw err;
                return done(null, user);
              });
            }

            return done(null, user); // user found, return that user
          
          } else {
            // if there is no user found with that facebook id, then create a user
            var newUser            = new User();

            // set all of the facebook information in their user model
            newUser.facebook.id    = profile.id; // sets the users facebook id
            newUser.facebook.token = token;      // we will save that token that facebook provides to the user
            newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // setting the name
            newUser.facebook.email = profile.emails[0].value; // setting the email

            // save the user to our database
            newUser.save(function(err) {
              if (err)
                throw err;

              // if successful, return the new user
              return done(null, newUser);
            });
          }
        });
      } else {
          // the user already exists and is logged in, we link accounts here
          var user = req.user; // pull the user out of the session

          // update the current user's facebook information
          user.facebook.id = profile.id;
          user.facebook.token = token;
          user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
          user.facebook.email = profile.emails[0].value;

          // saving the user
          user.save(function(err) {
            if (err)
              throw err;
            return done(null, user);
          });
        }
    });
  }));


  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    usernameField : "email",
    passwordField : "password",
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done){

    //asynchronous
    //User.findOne wont fire unless data is sent back
    process.nextTick(function(){

      // find a user whose email is the same as the form input
      // we are checking to see if the user trying to log in already exists
      User.findOne({'local.email' : email }, function(err, existingUser){
        if(err){
          return done(err);
        }

        if (existingUser) {
          return done(null, false, req.flash('signUpMessage', 'That email is already taken.'));
        }
        
        // if a user is logged in, then we're linking their account
        if(req.user) {
          var user = req.user;

          user.local.email    = email;
          user.local.password = user.generateHash(password);

          user.save(function(err) {
            if (err)
              throw err;
            return done(null, user);
          });
        } else {
          // if there is no user with that email
          // create the user
          var newUser       = new User();

          // set the user's local credentials
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          // save the user
          newUser.save(function(err){
            if(err){
              throw err;
            }
            return done(null, newUser);
          });
        }
      });
    });

  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override this with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) { // callback with email and password from our form

    // find a user whose email is the same as the form submission email
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'local.email' : email }, function(err, user) {
      // if there are any errors, return the error before anything else
      if (err)
        return done(err);

      // if no user is found, return the message
      if (!user)
        return done(null, false, req.flash('loginMessage', 'No user with that email found.'));

      // if the user is found but the password is wrong
      if (!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password!'));

      // all is well, return the successful user
      return done(null, user);
    });

  }));

};

