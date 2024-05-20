const express = require('express');
const cors = require('cors');
const User = require('./models/User')
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://mguerrerowest:mypassword@cluster0.cqwis4a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  
app.post('/register', async (req,res) => {
    const {username, password} = req.body
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    try{
        const userDoc = await User.create({username, password: hash}) 
        res.json(userDoc)
    } catch(e){
        res.status(400).json(e)
    }
});

app.listen(4000)
