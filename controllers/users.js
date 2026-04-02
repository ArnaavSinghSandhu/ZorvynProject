const pool = require('../db.js');
const { success, error } = require('../utils/response');


async function getUsers(req,res,next){
    try{
        const result = await pool.query(`
            SELECT id, name, email, role, status, created_at
            FROM users
            ORDER BY created_at DESC
        `)

        return success(res, result.rows, "Users fetched successfully");
    }
    catch(err){
        next(err);
    }
}

async function getUserById(req,res,next){
    try{
        const {id} = req.params

        const result = await pool.query(`
            SELECT id,name,email,role,status FROM users WHERE id = $1`,[id]);
        
        if(result.rows.length == 0){
            return error(res, 'User Not Found', 404);
        }

        return success(res, result.rows[0], "User fetched successfully");
    }catch(err){
        next(err);
    }
}

async function updateUserRole(req,res,next){
    try{
        const {id}  = req.params;
        const { role } = req.body;

        const validRoles = ['viewer', 'analyst', 'admin'];
        if(!validRoles.includes(role)){
            return error(res, 'Invalid role', 400);
        }

        const result = await pool.query(`
            UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
            [role, id]);
        
        if (result.rows.length === 0) {
            return error(res, 'User not found', 404);
        }

        return success(res, result.rows[0], "User role updated");
    }catch(err){
        next(err);
    }
}

async function toggleuserstatus(req,res,next){
    try{
        const {id} = req.params;

        const existing = await pool.query(`
            SELECT status FROM users WHERE id = $1`,
        [id]);

        if(existing.rows.length == 0){
            return res.status(404).json({ error: 'User not found' });
        }

        const newStatus = existing.rows[0].status === 'active'? "inactive":"active";

        const result = await pool.query(
            `UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, status`,
            [newStatus,id]
        )

        return res.status(200).json({user:result.rows[0]});
    }catch(err){
        next(err);
    }
}

async function deleteUser(req,res,next){
    try{
        const {id} = req.params;

        if(parseInt(id) === req.user.id){
            return res.status(400).json({error:"Can't Delete Your Own Account"});
        }

        const result = await pool.query(`
            DELETE FROM users WHERE id=$1 RETURNING id`,
        [id])

        if (result.rows.length == 0){
            return res.status(404).json({error:"Not Found"});
        }

        return res.status(200).json({message:"User Deleted"});
    }catch(err){
        next(err);
    }
}

module.exports = {getUsers,getUserById,updateUserRole,toggleuserstatus,deleteUser};



