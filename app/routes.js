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
};

// route middleware to make sure the user is logged in
function isLoggedIn(req, res, next){

  // if user is authenticated in the session carry on
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
};