const express = require('express');
const authRouter = express.Router();
 
const { register, login } = require('../controllers/auth.js');
const { registerValidator, loginValidator } = require('../validators/AuthValidation.js');
const validate = require('./validate.js');
 
authRouter.post('/register', registerValidator, validate, register);
authRouter.post('/login',    loginValidator,    validate, login);
 
module.exports = authRouter;