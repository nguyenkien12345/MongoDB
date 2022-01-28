const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: String,
    kids: [{type: mongoose.Schema.Types.ObjectId}],
    ordering: Number, // Thứ tự xuất hiện 
    active: Boolean   // Trạng thái hiển thị
});

module.exports = mongoose.model("Category", categorySchema);