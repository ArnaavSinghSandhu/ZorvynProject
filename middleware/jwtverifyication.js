const jwt = require('jsonwebtoken');
const pool = require('../db.js');

const {jwt: jwtConfig} = require("../config");


async function jwtAuthentication(req,res,next){
    const header = req.headers['authorization']

    if(!header || !header.startsWith("Bearer ")){
        return res.status(401).json({
            error : "Mising Or Malformed Authorization Header"
        })
    }


    const token = header.split(' ')[1];

    try{
        req.user = jwt.verify(token,jwtConfig.secret);
    }catch(err){
        return res.status(401).json({error: `Invalid or expired Token`})
    }

    const result = await pool
    .query('SELECT id, name, email, role, status FROM users WHERE id = $1',[req.user.id])

    const user = result.rows[0];

    if (!user)          return res.status(401).json({ error: 'User not found' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Account is deactivated' });
    console.log("TOKEN USER ID:", req.user.id);
    console.log("DB USER:", user);
    req.user = user;
    next();
}

async function attachUser(req, res, next) {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, status
             FROM users
             WHERE id = $1`,
            [req.user.id]
        );
 
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }
 
        const user = result.rows[0];
 
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'Account is deactivated' });
        }
 
        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = {jwtAuthentication, attachUser};