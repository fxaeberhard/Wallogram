var express = require('express');
var router = express.Router();
var mongo = require('mongoskin');
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

router.put('/renameLevel/:id', function(req, res) {
    var db = req.db;
    var id = req.params.id;
    db.collection('levels').update({_id: mongo.helper.toObjectID(id)},{$set:{name: req.body.name}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});


/*
 * DELETE to levels.
 */
router.delete('/deleteLevel/:id', function(req, res) {
    var db = req.db;
    var id = req.params.id
    console.log('DELETE '+id)
    db.collection('levels').remove({_id: mongo.helper.toObjectID(id)}, function(err){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;