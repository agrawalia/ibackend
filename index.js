require('dotenv').config()
var express = require('express')
var app = express()
//const port = 3000

app.get('/', function (req, res) {
  res.send('hello world')
})

app.get('/twitter', (req, res)=>{
    res.send("_lazyelegance");
})

app.get('/login', (req, res) => {
    res.send('<h1> Please login !</h1>')
})

app.listen(process.env.PORT, ()=>{
    console.log(`App listening at port ${process.env.PORT}`);
})