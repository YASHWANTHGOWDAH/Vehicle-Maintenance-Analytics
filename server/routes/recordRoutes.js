const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

// Filter options for dropdown population
router.get('/options', recordController.getFilterOptions);

// CRUD routes
router.get('/', recordController.getRecords);
router.get('/:id', recordController.getRecordById);
router.post('/', recordController.createRecord);
router.put('/:id', recordController.updateRecord);
router.delete('/:id', recordController.deleteRecord);

module.exports = router;
