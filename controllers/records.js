const pool = require('../db.js');
const { success, error } = require('../utils/response');


async function createRecord(req,res,next){
    try{
        const { amount, type, category, date, notes } = req.body;
        const result = await pool.query(
    `INSERT INTO records (amount, type, category, date, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [amount, type, category, date, notes, req.user.id]
);
    return success(res, result.rows[0], "Record created", 201);
    }catch(err){
        next(err);
    }
}

async function getRecords(req,res,next){
    try{
        const {category, type ,startDate, endDate, page = 1, limit = 20} = req.query;

        let query = "SELECT * FROM Records WHERE deleted_at IS NULL";
        const params = [];
        let i = 1;

        if(category){
            query += ` AND category = $${i++}`;
            params.push(category);
        }
        if (type) {
            query += ` AND type = $${i++}`
            params.push(type)
        }
        if (startDate) {
            query += ` AND date >= $${i++}`
            params.push(startDate)
        }
        if (endDate) {
            query += ` AND date <= $${i++}`
            params.push(endDate)
        }
        query += " ORDER BY date DESC";
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ` LIMIT $${i++} OFFSET $${i++}`;
        params.push(parseInt(limit), offset);


        const results = await pool.query(query,params);
        return success(res, results.rows, "Records fetched");
    }
    catch(err){
        next(err)
    }
}

async function updateRecord(req,res,next){
    try{
        const {id} = req.params;
        const {amount, type, category, date, notes} = req.body;

        const existing = await pool.query(
            'SELECT * FROM records WHERE id = $1 AND deleted_at IS NULL',
            [id]
        )

        if(existing.rows.length == 0){
            return error(res, 'Record Not Found', 404);
        }

        const current = existing.rows[0];

        const updated = await pool.query(
            `UPDATE records 
            SET
               amount   = $1,
               type     = $2,
               category = $3,
               date     = $4,
               notes    = $5,
            updated_at = NOW()
            WHERE id = $6
            RETURNING *`,
            [
            amount ?? current.amount,
            type     ?? current.type,
            category ?? current.category,
            date     ?? current.date,
            notes    ?? current.notes,
            id
            ]
        );
        return success(res, updated.rows[0], "Record updated");    }catch(err){
        next(err);
    }
}

async function deleteRecord(req, res, next) {
    try {
        const { id } = req.params;
 
        const result = await pool.query(
            `UPDATE records
             SET deleted_at = NOW()
             WHERE id = $1 AND deleted_at IS NULL
             RETURNING id`,
            [id]
        );
 
        if (result.rows.length === 0) {
            return error(res, 'Record not found', 404);
        }
 
        return success(res, { id: result.rows[0].id }, 'Record deleted');
    } catch (err) {
        next(err);
    }
}

module.exports = {updateRecord,getRecords,createRecord,deleteRecord};