const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// All Analytics combined
router.get('/all', analyticsController.getAllAnalytics);

// Individual pipeline endpoints
router.get('/cost-by-vehicle-type', analyticsController.getCostByVehicleType);
router.get('/records-by-brand', analyticsController.getRecordsByBrand);
router.get('/frequent-services', analyticsController.getFrequentServices);
router.get('/monthly-expenses', analyticsController.getMonthlyExpenses);
router.get('/parts-vs-labor', analyticsController.getPartsVsLabor);
router.get('/status-distribution', analyticsController.getStatusDistribution);
router.get('/top-expensive', analyticsController.getTopExpensive);
router.get('/service-centers', analyticsController.getServiceCenterPerformance);

module.exports = router;
