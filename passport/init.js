var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/wallo", {native_parser:true});
var login = require('./login');
var signup = require('./signup');

module.exports = function(passport){
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
     
    passport.deserializeUser(function(id, done) {
        db.collection('users').find({_id: mongo.helper.toObjectID(id)}).toArray(function (err, items) {
            done(err, items[0]);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);

}