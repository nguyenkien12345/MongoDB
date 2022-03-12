const express = require('express');
const app = express();

// Setup Views
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// Setup Mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nguyentrungkien:nguyentrungkien123456789@cluster0.hewrc.mongodb.net/VnExpress?retryWrites=true&w=majority', (err) => {
    if (!err) {
        console.log("Connect MongoDB Successfully");
    }
    else {
        console.log("Connect MongoDB Failure");
    }
})

// Setup body-parser 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
// urlencoded: Dữ liệu đượᴄ biểu diễn dưới dạng (keу, ᴠalue), nối ᴠới nhau bằng ký hiệu & thành một ᴄhuỗi (long ѕtring). 
// Trong mỗi ᴄặp (keу, ᴠalue), keу ᴠà ᴠalue táᴄh nhau bở dấu = (Vd: uѕername=ѕidtheѕloth&paѕѕᴡord=ѕlothѕeᴄret)

// Setup models
const Category = require('./models/Category');
const New = require('./models/New');

// Setup multer (multer: Thư viện hỗ trợ lưu file)
const multer = require('multer');
// Cấu hình lưu trữ file khi upload xong
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/upload'); // Khai báo đường dẫn lưu trữ file được upload
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "-" + file.originalname); // Tạo tên file là unique không trùng
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        // Những file được phép upload
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/gif" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            callback(null, true);
        }
        else {
            return callback(new Error('Only Image Are Allowed'));
        }
    }
}).single("fileImage");
// fileImage: chính là cái name của thẻ input có type là file mà ta sẽ upload file lên. Ta phải lấy đúng tên name từ thẻ input gắn vào single để cấu hình multer

// Setup routes
// ----------------------------------------------------------------------- Category ----------------------------------------------------------------------- 
app.get('/menu/add', (req, res) => {
    // Hiển thị file MasterAdmin truyền đi tham số page Add để lấy ra phần nội dung trang Add
    res.render('MasterAdmin', { page: 'Add' });
})

app.post('/menu/add', (req, res) => {
    let name = req.body.txtName;
    let ordering = parseInt(req.body.txtOrdering);
    let active = false;
    if (req.body.cbActive) {
        active = true;
    }
    else {
        active = false;
    }

    const category = new Category({ name: name, ordering: ordering, active: active, kids: [] });

    category.save((err) => {
        if (!err) {
            console.log("Add category successfully");
            res.redirect('http://localhost:5000/menu/list');
        }
        else {
            console.log("Add category failure");
        }
    })
})

app.get('/menu/edit/:id', (req, res) => {
    // Hiển thị file MasterAdmin truyền đi tham số page Edit lấy ra phần nội dung trang Edit, truyền biến data qua trang Edit
    let id = req.params.id;
    Category.findById(id, (err, data) => {
        if (!err) {
            res.render('MasterAdmin', { page: 'Edit', data: data });
        }
        else {
            console.log("Cann't Find Any Category Match");
        }
    })
})

app.post('/menu/edit', (req, res) => {
    let id = req.body.txtId;
    let name = req.body.txtName;
    let ordering = parseInt(req.body.txtOrdering);
    let active = false;
    if (req.body.cbActive) {
        active = true;
    }
    else {
        active = false;
    }
    Category.findByIdAndUpdate(id, { name: name, ordering: ordering, active: active }, (err) => {
        if (!err) {
            console.log("Update Category Success");
            res.redirect('http://localhost:5000/menu/list');
        }
        else {
            console.log("Update Category Failure");
        }
    })
})

app.get('/menu/delete/:id', (req, res) => {
    let id = req.params.id;
    Category.findByIdAndDelete(id, (err) => {
        if (!err) {
            console.log('Delete Category Successfully');
            res.redirect('http://localhost:5000/menu/list');
        }
        else {
            console.log('Delete Category Failure');
        }
    })
})

app.get('/menu/list', (req, res) => {
    Category.find((err, data) => {
        if (!err) {
            // Hiển thị file MasterAdmin truyền đi tham số page List lấy ra phần nội dung trang List, truyền biến data qua trang List 
            res.render('MasterAdmin', { page: 'List', data: data });
        }
        else {
            console.log("Fail To Load Data");
        }
    })
})
// ----------------------------------------------------------------------- Category ----------------------------------------------------------------------- 

// ----------------------------------------------------------------------- News ----------------------------------------------------------------------- 
app.get('/new/add', (req, res) => {
    // Hiển thị file MasterAdmin truyền đi tham số page new/add lấy ra phần nội dung trang new/add, truyền biến data qua trang new/add
    Category.find((err, data) => {
        if (!err) {
            res.render('MasterAdmin', { page: 'new/Add', data: data });
        }
        else {
            console.log("Cann't connect mongo db");
        }
    })
})

app.post('/new/add', (req, res) => {
    // Upload File
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            res.json({ kq: false, errMsg: `Upload Error ${err}` });
        }
        else if (err) {
            res.json({ kq: false, errMsg: `Upload Failed ${err}` });
        }
        else {
            let title = req.body.txtTitle;
            let content = req.body.txtContent;
            let description = req.body.txtDescription;
            let ordering = parseInt(req.body.txtOrder);
            let image = req.file.filename;
            let active = false;
            if (req.body.cbNews) {
                active = true;
            }
            else {
                active = false;
            }

            const news = new New({ title: title, content: content, description: description, ordering: ordering, image: image, active: active })

            news.save((err) => {
                if (!err) {
                    Category.findOneAndUpdate(
                        { _id: req.body.listCategory },
                        { $push: { kids: news._id } },
                        (err, data) => {
                            if (!err) {
                                console.log("Add news successfully");
                                res.redirect('http://localhost:5000/new/list');
                            }
                            else {
                                console.log("Add news failure");
                            }
                        }
                    )
                }
                else {
                    console.log("Add news failure");
                }
            })
        }
    });
});

app.get('/new/edit/:id', (req, res) => {
    // Hiển thị file MasterAdmin truyền đi tham số page new/edit lấy ra phần nội dung trang new/edit, truyền biến data qua trang new/edit
    let id = req.params.id;
    New.findById(id, (err, data) => {
        if (!err) {
            res.render('MasterAdmin', { page: 'new/Edit', data: data });
        }
        else {
            console.log("Cann't find any news match");
        }
    })
})

app.post('/new/edit', (req, res) => {
    let id = req.body.txtId;
    let title = req.body.txtTitle;
    let content = req.body.txtContent;
    let description = req.body.txtDescription;
    let ordering = parseInt(req.body.txtOrder);
    let image = req.file.filename;
    let active = false;
    if (req.body.cbNews) {
        active = true;
    }
    else {
        active = false;
    }

    New.findByIdAndUpdate(id, { title: title, content: content, description: description, ordering: ordering, image: image, active: active }, (err) => {
        if (!err) {
            console.log("Update news successfully");
            res.redirect('http://localhost:5000/new/list');
        }
        else {
            console.log("Update news failure");
        }
    })
})

app.get('/new/delete/:id', (req, res) => {
    let id = req.params.id;
    New.findByIdAndRemove(id, (err) => {
        if (!err) {
            console.log('Delete News Successfully');
            res.redirect('http://localhost:5000/new/list');
        }
        else {
            console.log("Delete News Failure");
        }
    })
})

app.get('/new/list', (req, res) => {
    // Hiển thị file MasterAdmin truyền đi tham số page new/list lấy ra phần nội dung trang new/list, truyền biến data qua trang new/list
    New.find((err, data) => {
        if (!err) {
            res.render('MasterAdmin', { page: 'new/List', data: data });
        }
        else {
            console.log("Fail To Load Data");
        }
    })
})
// ----------------------------------------------------------------------- News ----------------------------------------------------------------------- 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is listening at PORT ${PORT}`);
})