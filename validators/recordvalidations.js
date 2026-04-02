const {body, query, param} = require('express-validator');

const createRecordValidator = [
    body('amount')
        .exists({ checkFalsy: true }).withMessage('Amount is required')
        .bail()
        .isFloat({ gt: 0 }).withMessage('Amount must be a number greater than 0'),

    body('type')
        .exists({ checkFalsy: true }).withMessage('Type is required')
        .bail()
        .not().isIn(['Income', 'Expense']).withMessage('Type must be lowercase: income or expense'),

    body('category')
        .exists({ checkFalsy: true }).withMessage('Category is required')
        .bail()
        .isString().withMessage('Category must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Category must be between 1 and 100 characters'),

    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
        .isLength({ max: 255 }).withMessage('Notes must not exceed 255 characters')
];

const updateRecordValidator = [
    param('id')
        .isInt({ min: 1 }).withMessage('Record ID must be a positive integer'),

    body('amount')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Amount must be a number greater than 0'),

    body('type')
        .optional()
        .not().isIn(['Income', 'Expense']).withMessage('Type must be lowercase: income or expense'),

    body('category')
        .optional()
        .isString().withMessage('Category must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Category must be between 1 and 100 characters'),

    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
        .isLength({ max: 255 }).withMessage('Notes must not exceed 255 characters')
];

const recordQueryValidator = [
    query('startDate')
        .optional()
        .isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD)'),

    query('endDate')
        .optional()
        .isISO8601().withMessage('End date must be a valid date (YYYY-MM-DD)'),

    query('type')
        .optional()
        .isIn(['income', 'expense']).withMessage('Type must be either "income" or "expense"'),

    query('category')
        .optional()
        .isString().withMessage('Category must be a string'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
];
const deleteRecordValidator = [
    param('id')
        .isInt({ min: 1 }).withMessage('Record ID must be a positive integer'),
];

module.exports = {
    createRecordValidator,
    updateRecordValidator,
    recordQueryValidator,
    deleteRecordValidator,
}