var express = require('express');
var router = express.Router();
/*
 * POST to levels.
 */
router.post('/addLevel', function(req, res) {
    var db = req.db;
    db.collection('levels').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * GET to levels.
 */
router.get('/getLevel', function(req, res) {
    var db = req.db;
    var level = req.query.level;
    console.log(req.query.level)
    db.collection('levels').find({name:level}).toArray(function (err, items) {
        res.json(items[0]);
    });
});


router.get('/getAllLevels', function(req, res) {
    var db = req.db;
    var level = req.params.name;
    db.collection('levels').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * PUT to levels.
 */
router.put('/updateLevel', function(req, res) {
    var db = req.db;
    db.collection('levels').update({name:req.body.name},{$set:{player: req.body.player,width: req.body.width,height: req.body.height,countdownDuration: req.body.countdownDuration,entities: req.body.entities}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;