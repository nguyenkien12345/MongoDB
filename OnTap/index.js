const express = require('express');
const app = express();


// Setup body-parser 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));


// Setup Views
app.set('view engine','ejs');       // Thư viện view engine mà ta cài đặt là ejs
app.set('views','./views');         // Thư mục chứa các file view hiển thị và đường dẫn đến folder views đó
app.use(express.static("public"));  // Setup đường dẫn đến folder tĩnh


// Setup Mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nguyentrungkien:nguyentrungkien123456789@cluster0.hewrc.mongodb.net/OnTapMongoDB?retryWrites=true&w=majority', 
    // Write 1 callback function to check the connect status
    (err) => { 
    if(!err){
        console.log("Connect Successfully");
    }
    else{
        console.log("Connect Failed"); 
    }
});


// Setup models
const Cap1 = require('./models/Cap1');
const Cap2 = require('./models/Cap2');


// Setup routes
// Cách 1
// Table (collection) Cap1 is mother table. Add data into collection Cap1. Ta thêm thông qua đường dẫn
app.get('/cap1/:name', (req,res) => {
    let name = req.params.name;
    var cap1 = new Cap1({name: name, kids: []});
    // Save to mongoose => Write 1 callback function to check the storage status => If Save successfully, go back to the MongoDB website => Choose Collections => Check the data already in the database
    cap1.save((err) => {
        if(!err){
            res.json(cap1);
            console.log("Save Successfully");
        }
        else{
            console.log("Save Failed");
        }
    });
})


// Table (collection) Cap2 is child table. Add data into collection Cap2 (idMe => Id thằng mẹ). Ta thêm thông qua đường dẫn
app.get('/cap2/:idMe/:name', (req,res) => {
    let name = req.params.name;
    var cap2 = new Cap2({name: name});
    // Save to mongoose => Write 1 callback function to check the storage status => If Save successfully, go back to the MongoDB website => Choose Collections => Check the data already in the database
    cap2.save((err) => {
        if(!err){
            // Save _ID of this cap2 into the kids variable of cap1 (to know which cap2 belongs to cap1). See database on Mongo DB to clear visualization
            // findOneAndUpdate nhận vào 2 tham số: 1 là bạn muốn tìm cái gì, 2 là tìm được rồi thì làm cái gì
            Cap1.findOneAndUpdate(
                {_id: req.params.idMe},     // Tìm cái _id mẹ (_id của Cap1)
                {$push: {kids: cap2._id}},  // Thêm _id của Cap2 vào biến kids của Cap1
                (err) => {                  // Truyền vào 1 callback (Ta tự truyền thêm)
                    if(!err){
                        res.json(cap2);
                        console.log("Save Successfully");
                    }
                    else{
                        console.log("Save Failed");
                    }
                }
            )
        }
        else{
            console.log("Save Failed");
        }
    });
})


// Cách 2
// Table (collection) Cap1 is mother table. Add data into collection Cap1. Ta thêm thông qua form
app.post('/themCap1/',(req,res) => {
    var name = req.body.nameCap1;
    var cap1 = new Cap1({name: name, kids: []});
    cap1.save((err) => {
        if(!err){
            console.log("Add Data Cap1 Successfully");
            res.redirect("./home"); // Chuyển hướng về route home
        }
        else{
            console.log("Add Data Cap1 Failure");
        }
    });
})


// Table (collection) Cap2 is child table.  Add data into collection Cap2. Ta thêm thông qua form
app.post('/themCap2/',(req,res) => {
    var name = req.body.nameCap2;
    var idMe = req.body.selectCap1;
    var cap2 = new Cap2({name: name});
    cap2.save((err) => {
        if(!err){
            Cap1.findOneAndUpdate(
                {_id: idMe},                // Tìm cái _id mẹ (_id của Cap1)
                {$push: {kids: cap2._id}},  // Thêm _id của Cap2 vào biến kids của Cap1
                (err) => {
                    if(!err){
                        console.log("Add Data Cap2 Successfully");
                        res.redirect("./home"); // Chuyển hướng về route home
                    }
                    else{
                        console.log("Add Data Cap2 Failure");
                    }
                }
            )
        }
        else{
            console.log("Add Data Cap1 Failure");
        }
    });
})


// Get data from mongoose and display it on the screen
// Ta sẽ lấy từng ObjectId trong mảng kids của Cap1 đi so sánh vs từng thằng _id của Cap2 để lấy dữ liệu về nên ở đây ta sẽ dùng aggregate
app.get('/home', (req,res) => {
    var cap1 = Cap1.aggregate(
        // Tham số 1
        [{
            $lookup: {
                // from: Bạn muốn lookup tới đâu. Bạn đang dò cấp 1 bạn muốn lookup tới ai (Ở đây chính là cap2 (Lấy chính xác name trên database))
                from: "cap2",
                // Dữ liệu (tên cột) mà dùng để so sánh của bảng aggregate
                localField: "kids",
                // Dữ liệu (tên cột) mà dùng để so sánh của bảng ta lookup đến
                foreignField: "_id",
                // as đặt tên gì cũng được (tên định danh cho đám con)
                as: "childs"
            }
        }],
        // Tham số 2 (data sẽ nhận dữ liệu mà lookup trả về)
        (err,data) => {
            if(!err){
                // res.json(data);                 
                res.render('home', {data: data}); // Hiển thị file home.ejs. Truyền data vào cho file home để nó hiển thị ra dữ liệu
            }
            else{
                console.log("Fail to get data from MongoDB");
            }
        }
    )
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running at PORT: ${PORT}`);
})


// Lý thuyết 
// - Node là 1 server riêng, Mongoose là 1 server riêng. Khi ta start server Node, thì server Node nó sẽ connect qua Server mongoose
// - Lấy chuỗi kết nối trong Connect your application (thay cái username vs password vs tên database ta muốn đặt vào)
// - 1 Cluster tương ứng như 1 server có thể có nhiều database. 1 cluster chỉ nên dùng cho 1 khách hàng.
// - Khi lên server tất cả các tên bảng (Collection) sẽ được lưu thành chữ thường (Nếu bạn đặt tên bảng có chữ hoa thì tự động khi lưu lên server MongoDB sẽ ép về chữ thường hết). Nếu bạn đặt tên bảng mà kết thúc bằng kí tự chuỗi (chữ cái) ở cuối thì khi lưu lên server nó sẽ tự thêm chữ s 
// Vd Ta đặt tên bảng là Product thì khi lên Server nó sẽ lưu là products (Ép về lowercase và thêm chữ s vào cuối). Nhưng nếu ta kết thúc cái tên bảng bằng số thì nó sẽ không thêm s vào cuối tên bảng (Collection) mà giữ nguyên. Vd Ta đặt tên bảng là Cap1 thì khi lên Server nó sẽ lưu là cap1 (Không thêm s và ép kiểu về lowercase)
// aggregate nhận về 2 tham số: Tham số thứ nhất là array, tham số thứ 2 là callback để bắt lỗi và cái giá trị mongoose nó trả về
// lookup: Bạn đang tìm Cap1 nhưng mà bạn muốn dò Cap2