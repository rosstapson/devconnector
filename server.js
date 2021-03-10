const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')


const app = express();

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

// db

const db = require('./config/keys').mongoURI

mongoose
    .connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("mongodb connected")
    })
    .catch(err => {
        console.log(err)
    })

app.use(passport.initialize())

require('./config/passport.js')(passport)
// use routes
app.use('/api/users', users)
app.use('/api/posts', posts)
app.use('/api/profile', profile)

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('server running on port ' + port)
})