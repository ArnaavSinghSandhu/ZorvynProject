const pool = require('../db.js');
const { success, error } = require('../utils/response');

async function getSummary(req,res,next){
    try{
        const result = await pool.query(`SELECT
                SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
                SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END) AS net_balance
            FROM records
            WHERE deleted_at IS NULL`
        )

        return success(res, result.rows[0], "Summary fetched");
    }catch(err){
        next(err);
    }
}

async function getCategoryTotal(req,res,next){
    try{
        const result = await pool.query(`
            SELECT 
            category,
                type,
                SUM(amount) AS total,
                COUNT(*)    AS count
            FROM records
            WHERE deleted_at IS NULL
            GROUP BY category, type
            ORDER BY total DESC
            `)
        return success(res, result.rows, "Category totals fetched");
    }catch(err){
        next(err);
    }
}

async function getMonthlyTrends(req, res, next) {
    try {
        const result = await pool.query(`
            SELECT
                TO_CHAR(date, 'YYYY-MM') AS month,
                SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses,
                SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END) AS net
            FROM records
            WHERE deleted_at IS NULL
            GROUP BY TO_CHAR(date, 'YYYY-MM')
            ORDER BY month ASC
        `)

        return success(res, result.rows, "Trends fetched");

    } catch (err) {
        next(err)
    }
}

async function getRecentActivity(req,res,next){
    try{
        const limit = parseInt(req.query.limit) || 10;

        const result = await pool.query(`SELECT id, amount, type, category, date, notes
            FROM records
            WHERE deleted_at IS NULL
            ORDER BY date DESC
            LIMIT $1
        `, [limit]);

        return success(res, result.rows, "Recent activity fetched");

    }catch(err){
        next(err);
    }
}

module.exports = {getCategoryTotal,getSummary,getMonthlyTrends,getRecentActivity};