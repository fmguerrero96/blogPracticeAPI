const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://mguerrerowest:DAu6D7LcgrnAGvoA@cluster0.cqwis4a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

app.post('/register', (req,res) => {
    const {username, password} = req.body
    res.json({requestData: {username, password}})
});

app.listen(4000)
