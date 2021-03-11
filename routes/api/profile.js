const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const passport = require('passport')

const Profile = require('../../models/Profile')
const User = require('../../models/User')
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')

router.get('/test', (req, res) => {
    res.json({msg: "Profile works."})
})

router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {}
    
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'email', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user'
                return res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => {
            res.status(404).json(err)
        })
})

router.get('/handle/:handle', (req, res) => {
    const errors = {}
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'email', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user'
                return res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => {
            res.status(404).json(err)
        })
})


router.get('/user/:user_id', (req, res) => {
    const errors = {}
    
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'email', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user'
                return res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => {
            res.status(404).json({profile: 'Invalid user id'})
        })
})

router.get('/all', (req, res) => {
    const errors = {}
    
    Profile.find()
        .populate('user', ['name', 'email', 'avatar'])
        .then(profiles => {
            if(!profiles ) {
                errors.noprofile = 'No profiles'
                return res.status(404).json(errors)
            }
            res.json(profiles)
        })
        .catch(err => {
            res.status(404).json({profile: 'Invalid user id'})
        })
})

router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    
    const { errors, isValid} = validateProfileInput(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }

    const profileFields = {}
    profileFields.user = req.user.id
    if(req.body.handle) profileFields.handle = req.body.handle
    if(req.body.company) profileFields.company = req.body.company
    if(req.body.website) profileFields.website = req.body.website
    if(req.body.location) profileFields.location = req.body.location
    if(req.body.bio) profileFields.bio = req.body.bio
    if(req.body.status) profileFields.status = req.body.status
    if(req.body.githubUsername) profileFields.githubUsername = req.body.githubUsername
    // skills - split into array

    if(typeof(req.body.skills) !== 'undefined') {
        profileFields.skills = req.body.skills.split(',')
    }
    // social
    profileFields.social = {}
    
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook

    Profile.findOne({user: req.user.id})
        .then(profile => {
            if(profile) {
                //Update
                Profile.findOneAndUpdate(
                    {user: req.user.id}, 
                    {$set: profileFields}, 
                    {new: true}
                )
                    .then(profile => {
                        res.json(profile)
                    })
            }
            else {
                //Create
                // check if handle exists
                Profile.findOne({handle: profileFields.handle})
                    .then(profile => {
                        if(profile) {
                            errors.handle = 'Handle already exists'
                            return res.status(400).json(errors)
                        }
                        new Profile(profileFields).save()
                            .then(newProfile => {
                                res.json(newProfile)
                            })
                    })
            }
        })
})

router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body)
    if(!isValid) {
        return res.status(400).json(errors)
    }

    Profile.findOne({user: req.user.id})
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            profile.experience.unshift(newExp)

            profile.save()
                .then(profile => {
                    res.json(profile)
                })

        })
})


router.post('/education', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body)
    if(!isValid) {
        return res.status(400).json(errors)
    }

    Profile.findOne({user: req.user.id})
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldOfStudy: req.body.fieldOfStudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            profile.education.unshift(newEdu)

            profile.save()
                .then(profile => {
                    res.json(profile)
                })

        })
})


router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    

    Profile.findOne({user: req.user.id})
        .then(profile => {
            const removeIndex = profile.experience
                .map(item => {
                    return item.id
                })
                .indexOf(req.params.exp_id)
            profile.experience.splice(removeIndex, 1)
            profile.save()
                .then(profile => res.json(profile))
                .catch(err => res.status(404).json(err))
                
        })
})


router.delete('/education/:exp_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    

    Profile.findOne({user: req.user.id})
        .then(profile => {
            const removeIndex = profile.education
                .map(item => {
                    return item.id
                })
                .indexOf(req.params.exp_id)
            profile.education.splice(removeIndex, 1)
            profile.save()
                .then(profile => res.json(profile))
                .catch(err => res.status(404).json(err))
                
        })
})

router.delete('/:user_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOneAndRemove({ user: req.params.user_id})
        .then(() => {
            User.findOneAndRemove({_id: req.params.user_id})
                .then(() => {
                    res.json({ success: true})
                })
        })
})

module.exports = router