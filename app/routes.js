var mongoose = require('mongoose');

var User = require('./models/user');

module.exports = function(app, passport) {
  //Routes for rendering views =================================================
  app.get('/', function(req, res) {
      res.render('index.jade', {layout:'layout'});
  });

  app.get('/login', function(req, res) {
    res.render('login', {layout: 'layout', message: req.flash('loginMessage')});
  });

  app.get('/signup', function(req, res) {
    res.render('signup', {layout: 'layout', message: req.flash('signupMessage')});
  });

  //Secured routes for rendering profile =======================================
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile', {layout: 'layout', user: req.user});
  });

  //Route for logout ===========================================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  //Routes for login and signup ================================================
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  //Routes for facebook authentication =========================================
  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));
};

//Checking if the user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}
