const mongoose = require('mongoose');

const newSchema = mongoose.Schema({
    title: String,
    description: String,
    image: String,
    content: String,
    ordering: Number,
    active: Boolean
});

module.exports = mongoose.model('New', newSchema);