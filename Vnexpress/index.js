const express = require('express');
const app = express();


// Setup Views
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));


// Setup Mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nguyentrungkien:nguyentrungkien123456789@cluster0.hewrc.mongodb.net/VnExpress?retryWrites=true&w=majority', (err) => {
    if(!err){
        console.log("Connect MongoDB Successfully");
    }
    else{
        console.log("Connect MongoDB Failure");
    }
})


// Setup body-parser 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));


// Setup models
const Category = require('./models/Category');
const e = require('express');


// Setup routes
app.get('/menu/add', (req,res) => {
    // Hiển thị file MasterAdmin truyền đi tham số page Add để lấy ra phần nội dung trang Add
    res.render('MasterAdmin', {page: 'Add'}); 
})

app.post('/menu/add', (req,res) => {
    let name = req.body.txtName;
    let ordering = parseInt(req.body.txtOrdering);
    let active = false;
    if(req.body.cbActive){
        active = true;
    }
    else{
        active = false;
    }

    const category = new Category({name: name, ordering: ordering, active: active, kids:[]});

    category.save((err) => {
        if(!err){
            console.log("Add category successfully");
            res.redirect('http://localhost:5000/menu/list');
        }
        else{
            console.log("Add category failure");
        }
    }) 
})

app.get('/menu/edit/:id', (req,res) => {
    // Hiển thị file MasterAdmin truyền đi tham số page Edit lấy ra phần nội dung trang Edit, truyền biến data qua trang Edit
    let id = req.params.id;
    Category.findById(id, (err,data) => {
        if(!err){
            res.render('MasterAdmin', {page: 'Edit', data: data}); 
        }
        else{
            console.log("Cann't Find Any Category Match");
        }
    })
})

app.post('/menu/edit', (req,res) => {
    let id = req.body.txtId;
    let name = req.body.txtName;
    let ordering = parseInt(req.body.txtOrdering);
    let active = false;
    if(req.body.cbActive){
        active = true;
    }
    else{
        active = false;
    }
    Category.findByIdAndUpdate(id, {name: name, ordering: ordering, active: active}, (err) => {
        if(!err){
            console.log("Update Category Success");
            res.redirect('http://localhost:5000/menu/list');
        }
        else{
            console.log("Update Category Failure");
        }
    })
})

app.get('/menu/delete/:id', (req,res) => {
    let id = req.params.id;
    Category.findByIdAndDelete(id, (err) => {
        if(!err){
            console.log('Delete Category Successfully');
            res.redirect('http://localhost:5000/menu/list');
        }
        else{
            console.log('Delete Category Failure');
        }
    })
})

app.get('/menu/list', (req,res) => {
    Category.find((err,data) => {
        if(!err){
            // Hiển thị file MasterAdmin truyền đi tham số page List lấy ra phần nội dung trang List, truyền biến data qua trang List 
            res.render('MasterAdmin', {page: 'List', data: data}); 
        }
        else{
            console.log("Fail To Load Data");
        }
    })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is listening at PORT ${PORT}`);
})