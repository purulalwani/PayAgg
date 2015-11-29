var mongoose = require('mongoose');

var PreferenceSchema = new mongoose.Schema({
                                        merchantName: String,
                                        paymentMethods:[{key:String, value:String}]
                                        });

module.exports = mongoose.model('Preference', PreferenceSchema);