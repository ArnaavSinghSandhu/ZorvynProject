const express  = require('express');
const user = express.Router();
const {getUsers,getUserById,updateUserRole,toggleuserstatus,deleteUser} = require('../controllers/users.js');
const {requireRole} = require('../middleware/requirerole.js');
const {
    updateUserRoleValidation,
    toggleUserRole,
    userIdValidator,
} = require('../validators/usersvalidation');
const { jwtAuthentication, attachUser } = require('../middleware/jwtverifyication.js');
const validate = require('../middleware/validate.js');

user.use(jwtAuthentication, attachUser);

user.get('/',requireRole('admin'),getUsers);
user.get('/:id',userIdValidator,  validate, requireRole('admin'), getUserById);
user.put('/:id/role',updateUserRoleValidation, validate, requireRole('admin'), updateUserRole);
user.patch( '/:id/status',toggleUserRole,   validate, requireRole('admin'), toggleuserstatus);
user.delete('/:id',userIdValidator,  validate, requireRole('admin'), deleteUser);
module.exports = user;
