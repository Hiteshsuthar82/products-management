let mongoose = require('mongoose');

let schema = new mongoose.Schema(
    {
        code: String,
        country: String,
        flag: String,
        currencySign: String
    }, { timestamps: true });

module.exports = mongoose.model('Config', schema);