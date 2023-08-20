//jshint esversion:6
require('dotenv').config();
const express=require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
//const mongooseEncryption=require('mongoose-encryption');

const md5 = require('md5');

const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema= new mongoose.Schema({
    email:String,
    password:String
});

//userSchema.plugin(mongooseEncryption,{secret : process.env.SECRET,encryptedFields:['password']});

const User=mongoose.model('User',userSchema);

const app= express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', function(req, res) {
    res.render('home');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/register', function(req, res) {
    res.render('register');
});


app.post('/register',function(req,res){
    const newUser= new User({
        email:req.body.username,
        password:md5(req.body.password)
    })
    newUser.save()
    .then(res.render('secrets'))
    .catch(err=>{
        console.log(err);
    })
})


app.post('/login',function(req,res){
    User.findOne({email:req.body.username})
    .then((foundUser)=>{
        if(foundUser.password === md5(req.body.password)){
        res.render('secrets')
    }else{
        res.render('login');
    }
})
    .catch(err=>{
        console.log(err);
    })
})


app.listen(3000,function(){
    console.log("running on port 3000")
});
