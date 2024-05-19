const express = require('express');
const cors = require('cors');
const User = require('./models/User')
const mongoose = require("mongoose");
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://mguerrerowest:mypassword@cluster0.cqwis4a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  
app.post('/register', async (req,res) => {
    const {username, password} = req.body
    const userDoc = await User.create({username, password}) 
    res.json(userDoc)
});

app.listen(4000)
