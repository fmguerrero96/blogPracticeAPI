const express = require('express');
const cors = require('cors');
const User = require('./models/User')
const Post = require('./models/Post')
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs')
const app = express();

const secret = 'ksjdnihdsjkjncskjncknsoidcbapojslbc'

app.use(cors({credentials: true, origin:'http://localhost:5173'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://mguerrerowest:mypassword@cluster0.cqwis4a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  
app.post('/register', async (req,res) => {
    //get user info from request body
    const {username, password} = req.body
    //create salt and hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    //create a user with username from request body and hashed password
    try{
        const userDoc = await User.create({username, password: hash}) 
        res.json(userDoc)
    } catch(e){
        res.status(400).json(e)
    }
});

app.post('/login', async (req, res) => {
    //get user info from request body
    const {username, password} = req.body
    //find user in databse and store it in a const
    const userDoc = await User.findOne({username})
    //compare password from request body and hashed password from database
    const passOK = bcrypt.compareSync(password, userDoc.password);
    if(passOK){
        //if passwords match, generate a jwt
        jwt.sign({username, id:userDoc._id,}, secret, {}, (err, token) => {
            if(err) throw err;
            //respond with jwt as a cookie and send _id and username
            res.cookie('token', token).json({
                id: userDoc._id,
                username
        })
        })
    } else {
        res.status(400).json('Wrong Cretentials')
    }
})

app.get('/profile', (req, res) => {
    //grab token from request cookies
    const {token} = req.cookies
    //Read/decode token with secret key 
    jwt.verify(token, secret, {}, (err, info)=> {
        if (err) throw err
        //respond with decoded token info
        res.json(info)
    })
    
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok')
})

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext
    fs.renameSync(path, newPath)

    const {token} = req.cookies
    jwt.verify(token, secret, {}, async (err, info)=> {
        if (err) throw err
        const {title, summary, content} = req.body
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id  
        })
        res.json(postDoc)
    })
});

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null
    if(req.file){
        const {originalname, path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path+'.'+ext
        fs.renameSync(path, newPath)
    }

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info)=> {
        if (err) throw err
        const {id, title, summary, content} = req.body
        const postDoc = await Post.findById(id)
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id)
        if(!isAuthor){
            return res.status(400).json('you are not the author')
        }
        const updatedPost = await Post.findByIdAndUpdate(req.body.id, {
            title, 
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover
        })
        res.json(updatedPost)
    })
});

app.get('/post', async (req, res) => {
    res.json(
        await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1})
        .limit(20)
    )
});

app.get('/post/:id', async(req, res) => {
    const {id} = req.params
    const postDoc = await Post.findById(id).populate('author', 'username')
    res.json(postDoc)
});

app.listen(4000)
