var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var urlSchema = new Schema({
    url: {
        type: String
    },
    params: [
        { type: String }
    ],
    count: {
        type: Number
    }
});

module.exports = mongoose.model('urlSchema', urlSchema);