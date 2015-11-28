var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = require('../models/Users');

var crypto = require('crypto');
var jwt = require('jsonwebtoken');



generateJWT = function(user) {
    
    // set expiration to 60 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    
    return jwt.sign({
                    _id: user._id,
                    username: user.username,
                    exp: parseInt(exp.getTime() / 1000),
                    }, 'SECRET');
};

validPassword = function(user, password) {
    var hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64).toString('hex');
    
    return user.hash === hash;
};

setPassword = function(user, password){
    user.salt = crypto.randomBytes(16).toString('hex');
    
    user.hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64).toString('hex');
};



passport.use(new LocalStrategy(
                               function(username, password, done) {
                               User.findOne({ username: username }, function (err, user) {
                                            if (err) { return done(err); }
                                            if (!user) {
                                            return done(null, false, { message: 'Incorrect username.' });
                                            }
                                            if (!validPassword(user, password)) {
                                            return done(null, false, { message: 'Incorrect password.' });
                                            }
                                            return done(null, user);
                                            });
                               }
                               ));

