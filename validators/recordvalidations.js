const {body, query, param} = require('express-validator');

const createRecordValidator = [
    body('amount')
    .exists().withMessage("Hello")
    .bail()
    .isFloat({gt:0}).withMessage(`Amount Must Be Greater Than 0`),

    body('type')
    .exists().withMessage('Type Is Required')
    .bail()
    .not().isIn(['Income','Expense']).withMessage('Invalid Type'),

    body('category')
    .exists().withMessage("Hello")
    .bail()
    .isString().withMessage('Category Must Be A String'),

    body('notes')
    .optional()
    .isString().withMessage("Hello")
    .isLength({max:255}).withMessage("Notes Too Long")
];


const updateRecordValidator = [
    param('id')
    .isInt().withMessage('Invalid Record Id'),

    body('amount')
    .optional()
    .isFloat({gt : 0}),

    body('type')
    .optional()
    .isIn(['Income','expense']),

    body('category')
    .optional()
    .isString(),

    body('notes')
    .optional()
    .isString()
];


const recordQueryValidator = [
    query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid startDate'),


    query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid endDate'),


    query('type')
    .optional()
    .isIn(['income', 'expense']),

    query('category')
    .optional()
    .isString(),

    query('limit')
    .optional()
    .isInt({min: 1, max: 50}).withMessage('Limit must be in 1-50')
];
const deleteRecordValidator = [
    param('id')
        .isInt().withMessage('Invalid record ID'),
];

module.exports = {
    createRecordValidator,
    updateRecordValidator,
    recordQueryValidator,
    deleteRecordValidator,
}