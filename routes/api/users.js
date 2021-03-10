const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')

const User = require('../../models/User')
const keys = require('../../config/keys')

router.get('/test', (req, res) => {
    res.json({msg: "Users works."})
})

router.post('/register', (req, res) => {
    User.findOne({email: req.body.email})
        .then((u) => {
            if (u) {
                return res.status(400).json({email: 'Email already exists'})
            }
            else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // size
                    r: 'pg',   // rating
                    d: 'mm'     // default

                })
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) {
                            throw err
                        }
                        newUser.password = hash
                        newUser
                            .save()
                            .then(user => {
                                res.json(user)

                            })
                            .catch(err => {
                                console.log(err)
                            })
                    })
                })
            }
        })
})

router.post('/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password

    // find user
    User.findOne({email})
        .then(user => {
            if(!user) {
                return res.status(404).json({email: 'User not found'})
            }
            
            // check password
            bcrypt
                .compare(password, user.password)
                .then(isMatch => {
                    if(isMatch) {
                        // sign token
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        }
                        jwt
                            .sign(payload, keys.secret, {expiresIn: 3600 * 24}, (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                })
                            })
                            
                        
                    }
                    else {
                        return res.status(400).json({password: 'Invalid Password'})
                    }
                })
        })
})

router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
    })
})

module.exports = router