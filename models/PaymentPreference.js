var mongoose = require('mongoose');

var PreferenceSchema = new mongoose.Schema({
                                        merchantId: String,
                                        merchantName: String,
                                        preferences:String[]
                                        });

module.exports = mongoose.model('Preference', PreferenceSchema);