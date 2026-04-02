const express = require('express');

const router = express.Router();
const {updateRecord,getRecords,createRecord,deleteRecord} = require('../controllers/records')
const {requireRole} = require('../middleware/requirerole.js');
const {
    createRecordValidator,
    updateRecordValidator,
    recordQueryValidator,
    deleteRecordValidator,
} = require('../validators/recordvalidations');
const { jwtAuthentication, attachUser } = require('../middleware/jwtverifyication.js');
const validate = require('../middleware/validate.js');

router.use(jwtAuthentication, attachUser);

router.get(   '/',    recordQueryValidator,    validate, requireRole('analyst', 'admin'), getRecords);
router.post(  '/',    createRecordValidator,   validate, requireRole('admin'), createRecord);
router.put(   '/:id', updateRecordValidator,   validate, requireRole('admin'), updateRecord);
router.delete('/:id', deleteRecordValidator,   validate, requireRole('admin'), deleteRecord);
module.exports = router