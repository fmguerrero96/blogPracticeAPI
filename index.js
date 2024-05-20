const express = require('express');
const cors = require('cors');
const User = require('./models/User')
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const app = express();

const secret = 'ksjdnihdsjkjncskjncknsoidcbapojslbc'

app.use(cors({credentials: true, origin:'http://localhost:5173'}));
app.use(express.json());

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
            //respond with jwt as a cookie
            res.cookie('token', token).json('ok')
        })
    } else {
        res.status(400).json('Wrong Cretentials')
    }
})

app.listen(4000)
