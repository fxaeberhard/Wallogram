var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var app = express();

var isAuthenticated = function (req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler 
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated())
    return next();
  // if the user is not authenticated then redirect him to the login page
  res.redirect('/');
}

module.exports = function(passport){

  // /* GET login page. */
  // router.get('/', function(req, res) {
  //     // Display the Login page with any flash message, if any
  //   res.render('index', { message: req.flash('message') });
  // });

  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', {
    successRedirect: '/lobby',
    failureRedirect: '/',
    failureFlash : true  
  }));

  /* GET Registration Page */
  router.get('/signup', function(req, res){
    res.render('register',{message: req.flash('message')});
  });

  /* Handle Registration POST */
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/lobby',
    failureRedirect: '/signup',
    failureFlash : true  
  }));

  router.get('/setlocale/:locale', function (req, res) {
    res.cookie('wallolocale', req.params.locale);
    res.redirect('back');
  });

  // /* GET Home Page */
  // router.get('/lobby', isAuthenticated, function(req, res){
  //   res.render('lobby', { user: req.user });
  // });

  /* Handle Logout */
  router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  /* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', { title: 'Wallogram'});
  });

  router.get('/pad', function(req, res) {
    res.render('pad', { title: 'Wallogram - Pad', bodyClass: 'yui3-skin-sam' });
  });

  router.get('/screen', function(req, res) {
    res.render('screen', { title: 'Wallogram - Screen', bodyClass: 'wallo-stdmode' });
  });

  router.get('/lobby', function(req, res) {
    res.render('lobby', { title: 'Wallogram - Lobby'});
  });

  return router;
}