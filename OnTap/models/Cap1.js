const mongoose = require('mongoose');

const cap1Schema = new mongoose.Schema({
    name: String,
    kids: [{type: mongoose.Schema.Types.ObjectId}]
});

module.exports = mongoose.model('Cap1',cap1Schema);

// Lý thuyết
// - mongoose sẽ tự phát sinh cột _id với kiểu dữ liệu là ObjectId
// - kids: Để biết những thằng con cấp 2 thuộc về thằng mẹ cấp 1 nào thì ta sẽ khai báo 1 biến kids là mảng chứa các ObjectId của thằng con cấp 2 (Giống như kiểu 1 danh mục có nhiều sản phẩm thì danh mục chính là cấp 1, sản phẩm chính là cấp 2)
// - {type: mongoose.Schema.Types.ObjectId}: Kiểu dữ liệu của từng phần từ của cái mảng kids. 
// - Schema nó chỉ là cấu trúc thôi còn để tạo ra nguyên 1 collection thì nó phải là model. model này sẽ khai báo 2 tham số: 1 là tên collection, 2 là cấu trúc của nó => Nó sẽ hiểu là trên database mongoose nó lưu thằng này với tên là Cap1 và cấu trúc của nó lấy từ cap1Schema
// - Khi đặt tên cho bảng (collection) trong models nên đặt là chữ thường (Vd Cap1 => cap1)