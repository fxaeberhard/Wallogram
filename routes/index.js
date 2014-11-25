var express = require('express');
var router = express.Router();

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

module.exports = router;