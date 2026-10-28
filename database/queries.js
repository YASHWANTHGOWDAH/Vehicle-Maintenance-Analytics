/**
 * Vehicle Service and Maintenance Analytics Using MongoDB
 * database/queries.js
 * 
 * Demonstrates:
 * 1. Full CRUD Operations (Insert, Read, Update, Delete with test record protection)
 * 2. Search & Filtering Queries:
 *    - Search by service ID
 *    - Filter by vehicle brand
 *    - Filter by vehicle type
 *    - Filter by maintenance status
 *    - Finding repairs above a specified cost threshold
 *    - Finding records within a date range
 *    - Sorting by repair cost (ascending & descending)
 *    - Sorting by service date (ascending & descending)
 *    - Limiting results & pagination
 *    - Combining multiple filter conditions
 */

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'VehicleMaintenanceDB';
const collectionName = process.env.COLLECTION_NAME || 'service_records';

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    console.log(`=======================================================`);
    console.log(` MongoDB Search, Query & CRUD Demonstration Suite      `);
    console.log(` Database: ${dbName} | Collection: ${collectionName}   `);
    console.log(`=======================================================\n`);

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const totalCount = await collection.countDocuments();
    console.log(`[Status] Initial Document Count: ${totalCount}\n`);

    // -------------------------------------------------------------
    // SECTION 1: CRUD OPERATIONS
    // -------------------------------------------------------------
    console.log(`=======================================================`);
    console.log(` 1. CRUD OPERATIONS DEMONSTRATION                      `);
    console.log(`=======================================================`);

    // 1.1 CREATE: Insert a new test service record
    const testRecordId = 'VS-TEST-9999';
    await collection.deleteOne({ service_id: testRecordId }); // clean previous test if any

    const newRecord = {
      service_id: testRecordId,
      service_date: new Date('2026-10-28T00:00:00.000Z'),
      service_date_str: '2026-10-28',
      vehicle_type: 'SUV',
      vehicle_brand: 'Tata',
      vehicle_model: 'Harrier',
      service_type: 'Brake Repair',
      parts_cost: 3200.00,
      labor_cost: 1500.00,
      total_cost: 4700.00,
      odometer_km: 25400,
      service_center: 'Bengaluru Central',
      maintenance_status: 'In Progress',
      is_original: false // Explicitly marked as test record
    };

    console.log(`\n[CRUD 1/4 - INSERT] Inserting test record ${testRecordId}...`);
    const insertRes = await collection.insertOne(newRecord);
    console.log(`[CRUD INSERT Result] Inserted ID: ${insertRes.insertedId}`);

    // 1.2 READ: Read the inserted test record
    console.log(`\n[CRUD 2/4 - READ] Fetching record ${testRecordId}...`);
    const fetchedRecord = await collection.findOne({ service_id: testRecordId });
    console.log(`[CRUD READ Result]:`, {
      service_id: fetchedRecord.service_id,
      vehicle: `${fetchedRecord.vehicle_brand} ${fetchedRecord.vehicle_model} (${fetchedRecord.vehicle_type})`,
      cost: `₹${fetchedRecord.total_cost}`,
      status: fetchedRecord.maintenance_status
    });

    // 1.3 UPDATE: Update existing record
    console.log(`\n[CRUD 3/4 - UPDATE] Updating ${testRecordId} status to 'Completed' and total_cost to 4950.00...`);
    const updateRes = await collection.updateOne(
      { service_id: testRecordId },
      {
        $set: {
          maintenance_status: 'Completed',
          total_cost: 4950.00,
          labor_cost: 1750.00,
          notes: 'Replaced rear brake pads and bled brake lines.'
        }
      }
    );
    console.log(`[CRUD UPDATE Result] Matched: ${updateRes.matchedCount}, Modified: ${updateRes.modifiedCount}`);
    const updatedRecord = await collection.findOne({ service_id: testRecordId });
    console.log(`[CRUD Updated Record State]:`, {
      service_id: updatedRecord.service_id,
      status: updatedRecord.maintenance_status,
      total_cost: `₹${updatedRecord.total_cost}`,
      notes: updatedRecord.notes
    });

    // 1.4 DELETE: Delete test record safely (verifying is_original is not true)
    console.log(`\n[CRUD 4/4 - DELETE] Safely deleting test record ${testRecordId}...`);
    // Safety check: Never delete records where is_original is true!
    const targetToDelete = await collection.findOne({ service_id: testRecordId });
    if (targetToDelete && targetToDelete.is_original !== true) {
      const deleteRes = await collection.deleteOne({ service_id: testRecordId, is_original: { $ne: true } });
      console.log(`[CRUD DELETE Result] Deleted Count: ${deleteRes.deletedCount}`);
    } else {
      console.log(`[Safety Shield] Aborted delete: Protected original record!`);
    }

    const postCrudCount = await collection.countDocuments();
    console.log(`[Status] Post-CRUD Document Count (Must remain 600): ${postCrudCount}\n`);

    // -------------------------------------------------------------
    // SECTION 2: SEARCH & FILTERING QUERIES
    // -------------------------------------------------------------
    console.log(`=======================================================`);
    console.log(` 2. SEARCH & FILTERING QUERIES                         `);
    console.log(`=======================================================`);

    // 2.1 Search by Service ID
    console.log(`\n--- [Query 1] Search by Service ID ('VS0391') ---`);
    const q1 = await collection.findOne({ service_id: 'VS0391' });
    console.log(q1);

    // 2.2 Filter by Vehicle Brand
    console.log(`\n--- [Query 2] Filter by Vehicle Brand ('Toyota', limit 3) ---`);
    const q2 = await collection.find({ vehicle_brand: 'Toyota' }).limit(3).toArray();
    console.table(q2.map(r => ({ ID: r.service_id, Brand: r.vehicle_brand, Model: r.vehicle_model, Cost: r.total_cost, Status: r.maintenance_status })));

    // 2.3 Filter by Vehicle Type
    console.log(`\n--- [Query 3] Filter by Vehicle Type ('Motorcycle', limit 3) ---`);
    const q3 = await collection.find({ vehicle_type: 'Motorcycle' }).limit(3).toArray();
    console.table(q3.map(r => ({ ID: r.service_id, Type: r.vehicle_type, Brand: r.vehicle_brand, Model: r.vehicle_model, Service: r.service_type })));

    // 2.4 Finding repairs above a specified cost threshold (> ₹18,000)
    console.log(`\n--- [Query 4] High Cost Repairs (total_cost > 18000, limit 4) ---`);
    const q4 = await collection.find({ total_cost: { $gt: 18000 } }).sort({ total_cost: -1 }).limit(4).toArray();
    console.table(q4.map(r => ({ ID: r.service_id, Vehicle: `${r.vehicle_brand} ${r.vehicle_model}`, Service: r.service_type, Total: r.total_cost })));

    // 2.5 Filter by Maintenance Status
    console.log(`\n--- [Query 5] Filter by Maintenance Status ('In Progress', limit 3) ---`);
    const q5 = await collection.find({ maintenance_status: 'In Progress' }).limit(3).toArray();
    console.table(q5.map(r => ({ ID: r.service_id, Brand: r.vehicle_brand, Service: r.service_type, Center: r.service_center, Status: r.maintenance_status })));

    // 2.6 Finding records within a date range (2024-01-01 to 2024-03-31)
    console.log(`\n--- [Query 6] Date Range Query (2024-Q1: 2024-01-01 to 2024-03-31) ---`);
    const q6Count = await collection.countDocuments({
      service_date: {
        $gte: new Date('2024-01-01T00:00:00.000Z'),
        $lte: new Date('2024-03-31T23:59:59.999Z')
      }
    });
    console.log(`Total records in 2024-Q1: ${q6Count}`);
    const q6Sample = await collection.find({
      service_date: {
        $gte: new Date('2024-01-01T00:00:00.000Z'),
        $lte: new Date('2024-03-31T23:59:59.999Z')
      }
    }).sort({ service_date: 1 }).limit(3).toArray();
    console.table(q6Sample.map(r => ({ ID: r.service_id, Date: r.service_date.toISOString().slice(0, 10), Brand: r.vehicle_brand, Service: r.service_type, Cost: r.total_cost })));

    // 2.7 Sorting records by repair cost (Ascending & Descending)
    console.log(`\n--- [Query 7A] Top 3 Least Expensive Repairs (total_cost: 1) ---`);
    const q7Min = await collection.find().sort({ total_cost: 1 }).limit(3).toArray();
    console.table(q7Min.map(r => ({ ID: r.service_id, Service: r.service_type, Brand: r.vehicle_brand, TotalCost: r.total_cost })));

    console.log(`\n--- [Query 7B] Top 3 Most Expensive Repairs (total_cost: -1) ---`);
    const q7Max = await collection.find().sort({ total_cost: -1 }).limit(3).toArray();
    console.table(q7Max.map(r => ({ ID: r.service_id, Service: r.service_type, Brand: r.vehicle_brand, TotalCost: r.total_cost })));

    // 2.8 Sorting records by service date (Newest first & Oldest first)
    console.log(`\n--- [Query 8] Newest Service Records (service_date: -1, limit 3) ---`);
    const q8 = await collection.find().sort({ service_date: -1 }).limit(3).toArray();
    console.table(q8.map(r => ({ ID: r.service_id, Date: r.service_date.toISOString().slice(0, 10), Brand: r.vehicle_brand, Service: r.service_type })));

    // 2.9 Combining multiple filter conditions
    console.log(`\n--- [Query 9] Combined Query: Brand='Hyundai' AND vehicle_type='SUV' AND maintenance_status='Completed' ---`);
    const q9 = await collection.find({
      vehicle_brand: 'Hyundai',
      vehicle_type: 'SUV',
      maintenance_status: 'Completed'
    }).sort({ total_cost: -1 }).toArray();
    console.log(`Matched documents count: ${q9.length}`);
    console.table(q9.map(r => ({ ID: r.service_id, Model: r.vehicle_model, Service: r.service_type, Cost: r.total_cost, Center: r.service_center })));

    console.log(`\nQuery execution suite finished successfully.\n`);
  } catch (err) {
    console.error(`Error executing queries:`, err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  runQueries();
}

module.exports = { runQueries };
