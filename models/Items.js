var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
                                     title: String,
                                     link: String,
                                     Price: String
                                     });

module.exports = mongoose.model('Item', ItemSchema);

/**PostSchema.methods.upvote = function(cb) {
    this.upvotes += 1;
    this.save(cb);
};*/

