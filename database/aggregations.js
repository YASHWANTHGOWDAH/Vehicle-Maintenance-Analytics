/**
 * Vehicle Service and Maintenance Analytics Using MongoDB
 * database/aggregations.js
 * 
 * Implements 8 MongoDB Aggregation Pipelines:
 * 1. Total and average repair cost by vehicle type
 * 2. Number of service records by vehicle brand
 * 3. Most frequent service types
 * 4. Monthly maintenance expenses
 * 5. Total parts cost versus labor cost
 * 6. Maintenance status distribution
 * 7. Top 10 most expensive repairs
 * 8. Service center performance (service count, average cost, total revenue)
 */

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'VehicleMaintenanceDB';
const collectionName = process.env.COLLECTION_NAME || 'service_records';

// 1. Total and average repair cost by vehicle type
function getCostByVehicleTypePipeline() {
  return [
    {
      $group: {
        _id: '$vehicle_type',
        serviceCount: { $sum: 1 },
        totalRepairCost: { $sum: '$total_cost' },
        avgRepairCost: { $avg: '$total_cost' },
        minRepairCost: { $min: '$total_cost' },
        maxRepairCost: { $max: '$total_cost' }
      }
    },
    {
      $project: {
        _id: 0,
        vehicleType: '$_id',
        serviceCount: 1,
        totalRepairCost: { $round: ['$totalRepairCost', 2] },
        avgRepairCost: { $round: ['$avgRepairCost', 2] },
        minRepairCost: { $round: ['$minRepairCost', 2] },
        maxRepairCost: { $round: ['$maxRepairCost', 2] }
      }
    },
    { $sort: { totalRepairCost: -1 } }
  ];
}

// 2. Number of service records by vehicle brand
function getRecordsByBrandPipeline() {
  return [
    {
      $group: {
        _id: '$vehicle_brand',
        serviceCount: { $sum: 1 },
        totalCost: { $sum: '$total_cost' },
        avgCost: { $avg: '$total_cost' }
      }
    },
    {
      $project: {
        _id: 0,
        brand: '$_id',
        serviceCount: 1,
        totalCost: { $round: ['$totalCost', 2] },
        avgCost: { $round: ['$avgCost', 2] }
      }
    },
    { $sort: { serviceCount: -1 } }
  ];
}

// 3. Most frequent service types
function getMostFrequentServicesPipeline() {
  return [
    {
      $group: {
        _id: '$service_type',
        frequency: { $sum: 1 },
        totalRevenue: { $sum: '$total_cost' },
        avgCost: { $avg: '$total_cost' }
      }
    },
    {
      $project: {
        _id: 0,
        serviceType: '$_id',
        frequency: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        avgCost: { $round: ['$avgCost', 2] }
      }
    },
    { $sort: { frequency: -1 } }
  ];
}

// 4. Monthly maintenance expenses
function getMonthlyExpensesPipeline() {
  return [
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m', date: '$service_date' }
        },
        monthlyExpense: { $sum: '$total_cost' },
        serviceCount: { $sum: 1 },
        avgExpense: { $avg: '$total_cost' }
      }
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        monthlyExpense: { $round: ['$monthlyExpense', 2] },
        serviceCount: 1,
        avgExpense: { $round: ['$avgExpense', 2] }
      }
    },
    { $sort: { month: 1 } }
  ];
}

// 5. Total parts cost versus labor cost
function getPartsVsLaborPipeline() {
  return [
    {
      $group: {
        _id: null,
        totalPartsCost: { $sum: '$parts_cost' },
        totalLaborCost: { $sum: '$labor_cost' },
        totalOverallCost: { $sum: '$total_cost' },
        avgPartsCost: { $avg: '$parts_cost' },
        avgLaborCost: { $avg: '$labor_cost' },
        totalRecords: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        totalPartsCost: { $round: ['$totalPartsCost', 2] },
        totalLaborCost: { $round: ['$totalLaborCost', 2] },
        totalOverallCost: { $round: ['$totalOverallCost', 2] },
        avgPartsCost: { $round: ['$avgPartsCost', 2] },
        avgLaborCost: { $round: ['$avgLaborCost', 2] },
        partsPercentage: {
          $round: [
            { $multiply: [{ $divide: ['$totalPartsCost', '$totalOverallCost'] }, 100] },
            2
          ]
        },
        laborPercentage: {
          $round: [
            { $multiply: [{ $divide: ['$totalLaborCost', '$totalOverallCost'] }, 100] },
            2
          ]
        },
        totalRecords: 1
      }
    }
  ];
}

// 6. Maintenance status distribution
function getStatusDistributionPipeline() {
  return [
    {
      $group: {
        _id: '$maintenance_status',
        count: { $sum: 1 },
        totalValue: { $sum: '$total_cost' },
        avgValue: { $avg: '$total_cost' }
      }
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
        totalValue: { $round: ['$totalValue', 2] },
        avgValue: { $round: ['$avgValue', 2] }
      }
    },
    { $sort: { count: -1 } }
  ];
}

// 7. Top 10 most expensive repairs
function getTop10ExpensiveRepairsPipeline() {
  return [
    { $sort: { total_cost: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        service_id: 1,
        service_date: { $dateToString: { format: '%Y-%m-%d', date: '$service_date' } },
        vehicle: { $concat: ['$vehicle_brand', ' ', '$vehicle_model', ' (', '$vehicle_type', ')'] },
        service_type: 1,
        parts_cost: { $round: ['$parts_cost', 2] },
        labor_cost: { $round: ['$labor_cost', 2] },
        total_cost: { $round: ['$total_cost', 2] },
        odometer_km: 1,
        service_center: 1,
        maintenance_status: 1
      }
    }
  ];
}

// 8. Service center performance based on service count and average cost
function getServiceCenterPerformancePipeline() {
  return [
    {
      $group: {
        _id: '$service_center',
        totalServices: { $sum: 1 },
        avgRepairCost: { $avg: '$total_cost' },
        totalRevenue: { $sum: '$total_cost' },
        avgOdometer: { $avg: '$odometer_km' }
      }
    },
    {
      $project: {
        _id: 0,
        serviceCenter: '$_id',
        totalServices: 1,
        avgRepairCost: { $round: ['$avgRepairCost', 2] },
        totalRevenue: { $round: ['$totalRevenue', 2] },
        avgOdometer: { $round: ['$avgOdometer', 0] }
      }
    },
    { $sort: { totalServices: -1 } }
  ];
}

// Standalone Demonstration Runner
async function runAllAggregations() {
  const client = new MongoClient(uri);

  try {
    console.log(`=======================================================`);
    console.log(` MongoDB Aggregation Pipelines Execution Suite        `);
    console.log(` Database: ${dbName} | Collection: ${collectionName}   `);
    console.log(`=======================================================\n`);

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 1. Repair cost by vehicle type
    console.log(`>>> Pipeline 1: Total and Average Repair Cost by Vehicle Type`);
    const r1 = await collection.aggregate(getCostByVehicleTypePipeline()).toArray();
    console.table(r1);

    // 2. Records by vehicle brand
    console.log(`\n>>> Pipeline 2: Number of Service Records by Vehicle Brand`);
    const r2 = await collection.aggregate(getRecordsByBrandPipeline()).toArray();
    console.table(r2);

    // 3. Most frequent service types
    console.log(`\n>>> Pipeline 3: Most Frequent Service Types`);
    const r3 = await collection.aggregate(getMostFrequentServicesPipeline()).toArray();
    console.table(r3);

    // 4. Monthly maintenance expenses
    console.log(`\n>>> Pipeline 4: Monthly Maintenance Expenses (Timeline)`);
    const r4 = await collection.aggregate(getMonthlyExpensesPipeline()).toArray();
    console.table(r4.slice(0, 12)); // sample first 12 months
    console.log(`... Total months analyzed: ${r4.length}`);

    // 5. Parts cost vs labor cost
    console.log(`\n>>> Pipeline 5: Total Parts Cost vs Labor Cost`);
    const r5 = await collection.aggregate(getPartsVsLaborPipeline()).toArray();
    console.table(r5);

    // 6. Maintenance status distribution
    console.log(`\n>>> Pipeline 6: Maintenance Status Distribution`);
    const r6 = await collection.aggregate(getStatusDistributionPipeline()).toArray();
    console.table(r6);

    // 7. Top 10 most expensive repairs
    console.log(`\n>>> Pipeline 7: Top 10 Most Expensive Repairs`);
    const r7 = await collection.aggregate(getTop10ExpensiveRepairsPipeline()).toArray();
    console.table(r7);

    // 8. Service center performance
    console.log(`\n>>> Pipeline 8: Service Center Performance Analysis`);
    const r8 = await collection.aggregate(getServiceCenterPerformancePipeline()).toArray();
    console.table(r8);

    console.log(`\nAll 8 Aggregation pipelines executed successfully.\n`);
    return { r1, r2, r3, r4, r5, r6, r7, r8 };
  } catch (err) {
    console.error('Aggregation execution error:', err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  runAllAggregations();
}

module.exports = {
  getCostByVehicleTypePipeline,
  getRecordsByBrandPipeline,
  getMostFrequentServicesPipeline,
  getMonthlyExpensesPipeline,
  getPartsVsLaborPipeline,
  getStatusDistributionPipeline,
  getTop10ExpensiveRepairsPipeline,
  getServiceCenterPerformancePipeline,
  runAllAggregations
};
