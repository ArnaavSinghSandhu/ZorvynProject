const {body, param} = require('express-validator');

const updateUserRoleValidation = [
    param("id")
    .isInt().withMessage('Invalid User Id'),

    body("role")
    .exists().withMessage('Invalid User Id')
    .bail()
    .isIn(['viewer','analyst','admin'])
    .withMessage('Invalid User Type To Switch To')
];

const userIdValidator = [
    param('id')
        .isInt()
        .withMessage('User ID must be a number')
];


const toggleUserRole = [
    param("id")
    .isInt().withMessage("Invaliid Id"),
];

module.exports = {
    updateUserRoleValidation,
    toggleUserRole,
    userIdValidator,
};



