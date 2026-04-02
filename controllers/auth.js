const pool = require('../db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config');
const { success, error } = require('../utils/response.js');
 
async function register(req, res, next) {
    try {
        const { name, email, password, role = 'viewer' } = req.body;
 
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
 
        if (existing.rows.length > 0) {
            return error(res, 'Email already in use', 409);
        }
 
        const passwordHash = await bcrypt.hash(password, 12);
 
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, status)
             VALUES ($1, $2, $3, $4, 'active')
             RETURNING id, name, email, role, status`,
            [name, email, passwordHash, role]
        );
 
        return success(res, result.rows[0], 'User registered', 201);
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
 
        const result = await pool.query(
            `SELECT id, name, email, role, status, password_hash
             FROM users WHERE email = $1`,
            [email]
        );
 
        if (result.rows.length === 0) {
            return error(res, 'Invalid credentials', 401);
        }
 
        const user = result.rows[0];
 
        if (user.status !== 'active') {
            return error(res, 'Account is deactivated', 403);
        }
 
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return error(res, 'Invalid credentials', 401);
        }
 
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn || '7d' }
        );
 
        return success(res, {
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        }, 'Login successful');
    } catch (err) {
        next(err);
    }
}
 
module.exports = { register, login };