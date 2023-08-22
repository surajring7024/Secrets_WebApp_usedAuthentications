//jshint esversion:6
require('dotenv').config();
const express=require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

//const mongooseEncryption=require('mongoose-encryption');
//const md5 = require('md5');

// const bcrypt=require('bcrypt');
// const saltRounds=10;

const passport = require('passport');
const passportlocalmongoose = require('passport-local-mongoose');
const session = require('express-session');


const app= express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret:'mynameisSuraj',
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema= new mongoose.Schema({
    username:String,
    password:String
});

//userSchema.plugin(mongooseEncryption,{secret : process.env.SECRET,encryptedFields:['password']});

userSchema.plugin(passportlocalmongoose);

const User=mongoose.model('User',userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/register', function(req, res) {
    res.render('register');
});

app.get('/secrets', function(req, res) {
    if(req.isAuthenticated()) {
     res.render('secrets');
    }else{
        res.redirect('/login');
    }

});

app.get('/logout', function(req, res) {
    req.logout(function(err, res) {
        if(err){
            console.log(err);
        }
    });
    res.redirect('/');
});

app.post('/register',function(req,res){
    //used bcrypt authentication

    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser= new User({
    //         username:req.body.username,
    //         password:hash
    //     })
    //     newUser.save()
    //     .then(res.render('secrets'))
    //     .catch(err=>{
    //         console.log(err);
    //     })
    // });

    //used md5 authentication

    // const newUser= new User({
    //     username:req.body.username,
    //     //password:md5(req.body.password)       //used md5 password
    //     password:req.body.password
    // })
    // newUser.save()
    // .then(res.render('secrets'))
    // .catch(err=>{
    //     console.log(err);
    // })


    //use session and cookies for authentication

    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register');
        }else{
            passport.authenticate("local")(req,res,function(err){
            res.redirect('/secrets');
            })
        }
    })

})


app.post('/login',function(req,res){

    // User.findOne({username:req.body.username})
    // .then((foundUser)=>{
    //   //bcrypt compare used to compare hashes against username
    //    bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
    //    if(result===true){
    //     res.render('secrets')
    //    }else{
    //     res.send(err);
    //    }
    // });  
    // })
    // .catch(err=>{
    //     console.log(err);
    // })

//     User.findOne({username:req.body.username})
//     .then((foundUser)=>{
//        // if(foundUser.password === md5(req.body.password)){             ///used md5 password
//         if(foundUser.password === req.body.password){

//         res.render('secrets')
//     }else{
//         res.render('login');
//     }
//      })
//     .catch(err=>{
//         console.log(err);
//     })

    const user=new User({
        username:req.body.username,
        password:req.body.password
    })

    req.logIn(user, function(err) {
        if (err) {
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(err){
            res.redirect('/secrets');
            });
        }
    });
})


app.listen(3000,function(){
    console.log("running on port 3000")
});
