import dotenv from 'dotenv'
// require('dotenv').config()
import express from 'express';
var app = express()
const port = process.env.PORT || 3000

app.get('/', function (req, res) {
  res.send('hello world')
})

app.get('/twitter', (req, res)=>{
    res.send("_lazyelegance");
})

app.get('/login', (req, res) => {
    res.send('<h1> Please login !</h1>')
})

app.listen(port, ()=>{
    console.log(`App listening at port ${port}`);
})