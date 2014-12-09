var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../app/models/user');

var authConfig = require('./auth');

module.exports = function(passport) {
  //Serialize user into session
  passport.serializeUser(function(user, done) {
      done(null, user.id);
  });

  //Deserialize user
  passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
          done(err, user);
      });
  });

  //Local signup strategy
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    User.findOne({'local.email': email}, function(err, user) {
      if(err)
        return done(err);
      if(user)
        return done(null, false, req.flash('signupMessage', 'This email is already taken !!!'));
      else {
        var newUser = new User();
        newUser.local.email = email;
        newUser.local.password = newUser.generateHash(password);
        newUser.local.school = req.body.school;

        newUser.save(function(err) {
          if(err)
            return done(err);
          return done(null, newUser);
        });
      }
    });
  }));

  //Local login strategy
  passport.use('local-login', new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
  },
  function(req, email, password, done) {
      User.findOne({ 'local.email' :  email }, function(err, user) {
          if (err)
              return done(err);
          if (!user)
              return done(null, false, req.flash('loginMessage', 'Wrong email address !!!'));
          if (!user.isValidPassword(password))
              return done(null, false, req.flash('loginMessage', 'Wrong password !!!'));
          return done(null, user);
      });

  }));
  
  //Facebook strategy
  passport.use(new FacebookStrategy({
      clientID: authConfig.facebookAuth.clientID,
      clientSecret: authConfig.facebookAuth.clientSecret,
      callbackURL: authConfig.facebookAuth.callbackURL,
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({'facebook.id': profile.id}, function(err, user) {
        if(err)
          done(err);
        if(user)
          return done(null, user);
        else {
          var newUser = new User()
          newUser.facebook.id = profile.id;
          newUser.facebook.token = accessToken;
          newUser.facebook.email = profile.emails[0].value;
          newUser.facebook.firstName =  profile.name.givenName;
          newUser.facebook.familyName =  profile.name.familyName;

          newUser.save(function(err) {
            if(err)
              return done(err);
            return done(null, newUser);
          });
        }
      });
  }));
};
