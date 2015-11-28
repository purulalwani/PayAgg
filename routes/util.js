var crypto = require('crypto');
var jwt = require('jsonwebtoken');


exports.generateJWT = function(user) {
    
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


exports.setPassword = function(user, password){
    user.salt = crypto.randomBytes(16).toString('hex');
    
    user.hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64).toString('hex');
};