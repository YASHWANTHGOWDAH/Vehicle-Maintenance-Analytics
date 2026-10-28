const { getCollection } = require('../config/db');
const {
  getCostByVehicleTypePipeline,
  getRecordsByBrandPipeline,
  getMostFrequentServicesPipeline,
  getMonthlyExpensesPipeline,
  getPartsVsLaborPipeline,
  getStatusDistributionPipeline,
  getTop10ExpensiveRepairsPipeline,
  getServiceCenterPerformancePipeline
} = require('../../database/aggregations');

// GET /api/stats - Dashboard Overview Statistics & KPIs
exports.getDashboardKPIs = async (req, res) => {
  try {
    const collection = getCollection();

    // Aggregated KPI numbers
    const [kpiResult, brandCountResult, commonServiceResult] = await Promise.all([
      collection.aggregate([
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            totalExpenses: { $sum: '$total_cost' },
            avgCost: { $avg: '$total_cost' },
            totalPartsCost: { $sum: '$parts_cost' },
            totalLaborCost: { $sum: '$labor_cost' },
            avgOdometer: { $avg: '$odometer_km' }
          }
        }
      ]).toArray(),

      collection.aggregate([
        { $group: { _id: '$vehicle_brand' } },
        { $count: 'brandCount' }
      ]).toArray(),

      collection.aggregate([
        { $group: { _id: '$service_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]).toArray()
    ]);

    const stats = kpiResult[0] || {
      totalRecords: 0,
      totalExpenses: 0,
      avgCost: 0,
      totalPartsCost: 0,
      totalLaborCost: 0,
      avgOdometer: 0
    };

    const brandCount = brandCountResult[0] ? brandCountResult[0].brandCount : 0;
    const mostCommonService = commonServiceResult[0]
      ? { type: commonServiceResult[0]._id, count: commonServiceResult[0].count }
      : { type: 'N/A', count: 0 };

    res.json({
      success: true,
      data: {
        totalRecords: stats.totalRecords,
        totalExpenses: Math.round(stats.totalExpenses * 100) / 100,
        avgCost: Math.round(stats.avgCost * 100) / 100,
        totalPartsCost: Math.round(stats.totalPartsCost * 100) / 100,
        totalLaborCost: Math.round(stats.totalLaborCost * 100) / 100,
        avgOdometer: Math.round(stats.avgOdometer),
        vehicleBrandCount: brandCount,
        mostCommonService
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard KPIs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/cost-by-vehicle-type
exports.getCostByVehicleType = async (req, res) => {
  try {
    const collection = getCollection();
    const data = await collection.aggregate(getCostByVehicleTypePipeline()).toArray();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/records-by-brand
exports.getRecordsByBrand = async (req, res) => {
  try {
    const collection = getCollection();
    const data = await collection.aggregate(getRecordsByBrandPipeline()).toArray();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/frequent-services
exports.getFrequentServices = async (req, res) => {
  try {
    const collection = getCollection();
    const data = await collection.aggregate(getMostFrequentServicesPipeline()).toArray();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/monthly-expenses
exports.getMonthlyExpenses = async (req, res) => {
  try {
    const collection = getCollection();
    const data = await collection.aggregate(getMonthlyExpensesPipeline()).toArray();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/parts-vs-labor
exports.getPartsVsLabor = async (req, res) => {
  try {
    const collection = getCollection();
    const data = await collection.aggregate(getPartsVsLaborPipeline()).toArray();
    res.json({ success: true, data: data[0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/status-distribution
exports.getStatusDistribution = async (req, res) => {
  try {
    const collection = getCollection();
    const data = await collection.aggregate(getStatusDistributionPipeline()).toArray();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/top-expensive
exports.getTopExpensive = async (req, res) => {
  try {
    const collection = getCollection();
    const data = await collection.aggregate(getTop10ExpensiveRepairsPipeline()).toArray();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/service-centers
exports.getServiceCenterPerformance = async (req, res) => {
  try {
    const collection = getCollection();
    const data = await collection.aggregate(getServiceCenterPerformancePipeline()).toArray();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/analytics/all - Combined Analytics Payload
exports.getAllAnalytics = async (req, res) => {
  try {
    const collection = getCollection();

    const [
      costByVehicleType,
      recordsByBrand,
      frequentServices,
      monthlyExpenses,
      partsVsLabor,
      statusDistribution,
      topExpensive,
      serviceCenterPerformance
    ] = await Promise.all([
      collection.aggregate(getCostByVehicleTypePipeline()).toArray(),
      collection.aggregate(getRecordsByBrandPipeline()).toArray(),
      collection.aggregate(getMostFrequentServicesPipeline()).toArray(),
      collection.aggregate(getMonthlyExpensesPipeline()).toArray(),
      collection.aggregate(getPartsVsLaborPipeline()).toArray(),
      collection.aggregate(getStatusDistributionPipeline()).toArray(),
      collection.aggregate(getTop10ExpensiveRepairsPipeline()).toArray(),
      collection.aggregate(getServiceCenterPerformancePipeline()).toArray()
    ]);

    res.json({
      success: true,
      data: {
        costByVehicleType,
        recordsByBrand,
        frequentServices,
        monthlyExpenses,
        partsVsLabor: partsVsLabor[0] || {},
        statusDistribution,
        topExpensive,
        serviceCenterPerformance
      }
    });
  } catch (err) {
    console.error('Error fetching all analytics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
