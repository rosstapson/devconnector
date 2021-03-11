const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateExperienceInput(data) {
    let errors = {}

    
    data.title = !isEmpty(data.title) ? data.title : ''
    data.company = !isEmpty(data.company) ? data.company : ''
    data.from = !isEmpty(data.from) ? data.from : ''
    data.current = !isEmpty(data.current) ? data.current : ''


    if (Validator.isEmpty(data.title)) {
        errors.title = 'Title field is required'
    }

    if (Validator.isEmpty(data.company)) {
        errors.company = 'Company field is required'
    }

    if (Validator.isEmpty(data.current)) {
        errors.current = 'Current date field is required'
    }

    if (Validator.isEmpty(data.from)) {
        errors.from = "From field is required"
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }
}