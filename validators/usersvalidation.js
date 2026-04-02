const {body, param} = require('express-validator');

const updateUserRoleValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),

    body('role')
        .exists({ checkFalsy: true }).withMessage('Role is required')
        .bail()
        .isIn(['viewer', 'analyst', 'admin'])
        .withMessage('Role must be one of: viewer, analyst, admin')
];

const userIdValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer')
];


const toggleUserRole = [
    param('id')
        .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
];

module.exports = {
    updateUserRoleValidation,
    toggleUserRole,
    userIdValidator,
};



