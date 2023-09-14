const express = require('express');

const router = express.Router();
const path = require("path");



router.get('/',(req, res) => {
    res.render('Index');
});

router.get('/signup',(req, res) => {
    res.render('Signup');
});

router.get('/login',(req, res) => {
    res.render('Login');
});

router.get('/index',(req, res) => {
    res.render('Index');
});

router.get('/frontpageroute',(req, res) => {
    res.render('Home');
});
router.get('/about',(req,res)=>{
    res.render('About');
});
router.get('/contact',(req,res)=>{
    res.render('Contact');
});


module.exports = router;