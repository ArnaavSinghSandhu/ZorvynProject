const { body } = require('express-validator');

const registerValidator = [
    body('name')
        .exists().withMessage('Name is required')
        .bail()
        .isString()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

    body('email')
        .exists().withMessage('Email is required')
        .bail()
        .isEmail().withMessage('Invalid email address'),

    body('password')
        .exists().withMessage('Password is required')
        .bail()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

    body('role')
        .optional()
        .isIn(['viewer', 'analyst', 'admin']).withMessage('Invalid role'),
];

const loginValidator = [
    body('email')
        .exists().withMessage('Email is required')
        .bail()
        .isEmail().withMessage('Invalid email address'),

    body('password')
        .exists().withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };