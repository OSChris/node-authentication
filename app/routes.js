module.exports = function(app, passport) {
  //=============================
  // HOME PAGE (WITH LOGIN LINKS)
  //=============================
  app.get('/', function(req, res){
    res.render('index.ejs'); // loads the index.ejs template
  });

  //=============================
  // LOGIN 
  //=============================
  
  app.get('/login', function(req, res){
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash    : true
  }));

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    });
  });


  //=============================
  // SIGNUP
  //=============================
  
  app.get('/signup', function(req, res){
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });
  
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // takes the new user to the profile page upon successful sign up
    failureRedirect : '/signup',  // redirect back to the sign up page if there is an error
    failureFlash    : true        // allow flash messages
  }));

  //=============================
  // LOGOUT
  //=============================
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  //=============================
  // FACEBOOK ROUTES
  //=============================
  // route for facebook authentication and login
  app.get('/auth/facebook', passport.authenticate('facebook', {scope : 'email' }));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  //=============================
  // TWITTER ROUTES
  //=============================
  // route for twitter authentication and login
  app.get('/auth/twitter', passport.authenticate('twitter'));

  // handle the callback after twitter authenticates the user
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

  // =====================================
  // GOOGLE ROUTES =======================
  // =====================================
  // send to google to do the authentication
  // profile gets us their basic information including their name
  // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
      passport.authenticate('google', {
              successRedirect : '/profile',
              failureRedirect : '/'
      }));

  // =============================================================================
  // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
  // =============================================================================

  // locally ---------------

    app.get('/connect/local', function(req, res) {
      res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/connect/local', passport.authenticate('local-signup', {
      successRedirect : '/profile',
      failureRedirect : '/connect/local',
      failureFlash    : true
    }));

  // facebook --------------
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    app.get('/connect/facebook',
      passport.authorize('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
      }));

  // twitter ---------------
    app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

    app.get('/connect/twitter',
      passport.authorize('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/'
      }));

  // google ----------------
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    app.get('/connect/google',
      passport.authorize('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
      }));
  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local ----------------
    app.get('/unlink/local', function(req, res) {
      var user = req.user;
      user.local.email    = undefined;
      user.local.password = undefined;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });

  // facebook -------------
    app.get('/unlink/facebook', function(req, res) {
      var user            = req.user;
      user.facebook.token = undefined;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });

  // twitter ---------------
    app.get('/unlink/twitter', function(req, res) {
      var user           = req.user;
      user.twitter.token = undefined;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });
  // google ----------------
    app.get('/unlink/google', function(req, res) {
      var user           = req.user;
      user.google.token  = undefined;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });
};


// route middleware to make sure the user is logged in
function isLoggedIn(req, res, next){

  // if user is authenticated in the session carry on
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
};