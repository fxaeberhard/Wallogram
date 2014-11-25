var express = require('express');
var router = express.Router();
/*
 * POST to platforms.
 */
router.post('/addPlatform', function(req, res) {
    var db = req.db;
    db.collection('platforms').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * GET to platforms.
 */
router.get('/getPlatform', function(req, res) {
    var db = req.db;
    var level = req.params.level;
    console.log("############")
    db.collection('platforms').find({name:"test"}).toArray(function (err, items) {
        res.json(items[0]);
    });
});

/*
 * PUT to platforms.
 */
router.put('/updatePlatform', function(req, res) {
	console.log("********************")
	console.log(req.body)
    console.log("********************")
    console.log(req.body.entities)
    // console.log(obj)
    // console.log("********************")
    // console.log(obj.entities)
    var db = req.db;
    db.collection('platforms').update({name:req.body.name},{$set:{player: req.body.player,width: req.body.width,height: req.body.height,countdownDuration: req.body.countdownDuration,entities: req.body.entities}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;