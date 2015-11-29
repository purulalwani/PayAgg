var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
                                     username: {type: String, lowercase: true, unique: true},
                                     hash: String,
                                     salt: String,
                                     merchantName  : String,
                                     mobileNumber :String,
                                     merchantId : String

                                     });

module.exports = mongoose.model('User', UserSchema);