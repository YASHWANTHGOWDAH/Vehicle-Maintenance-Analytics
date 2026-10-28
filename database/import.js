const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'VehicleMaintenanceDB';
const collectionName = process.env.COLLECTION_NAME || 'service_records';

// CSV Parser helper without external dependency
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV line splitting (handles potential quoted commas if any)
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length !== headers.length) {
      console.warn(`Line ${i + 1} has ${values.length} fields instead of ${headers.length}:`, line);
      continue;
    }

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });

    // Type Conversions & Validations
    const record = {
      service_id: String(row.service_id).trim(),
      service_date: new Date(row.service_date + 'T00:00:00.000Z'),
      service_date_str: String(row.service_date).trim(), // preserve original ISO string representation
      vehicle_type: String(row.vehicle_type).trim(),
      vehicle_brand: String(row.vehicle_brand).trim(),
      vehicle_model: String(row.vehicle_model).trim(),
      service_type: String(row.service_type).trim(),
      parts_cost: parseFloat(row.parts_cost),
      labor_cost: parseFloat(row.labor_cost),
      total_cost: parseFloat(row.total_cost),
      odometer_km: parseInt(row.odometer_km, 10),
      service_center: String(row.service_center).trim(),
      maintenance_status: String(row.maintenance_status).trim(),
      is_original: true // Flag to protect original 600 academic dataset records
    };

    records.push(record);
  }

  return records;
}

async function importDataset() {
  const client = new MongoClient(uri);

  try {
    console.log(`=======================================================`);
    console.log(`Vehicle Service & Maintenance Analytics: Data Importer`);
    console.log(`=======================================================`);
    console.log(`Connecting to MongoDB at: ${uri}`);
    await client.connect();
    console.log(`Successfully connected! Target Database: "${dbName}"`);

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Locate dataset CSV file
    let csvPath = path.join(__dirname, 'vehicle_service_maintenance_dataset.csv');
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '..', 'vehicle_service_maintenance_dataset.csv');
    }

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    console.log(`Reading dataset from: ${csvPath}`);
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const records = parseCSV(fileContent);
    console.log(`Parsed ${records.length} records from CSV.`);

    if (records.length !== 600) {
      console.warn(`WARNING: Expected 600 records, but found ${records.length}!`);
    }

    // Verify duplicate service IDs
    const idSet = new Set();
    const duplicates = [];
    for (const r of records) {
      if (idSet.has(r.service_id)) {
        duplicates.push(r.service_id);
      }
      idSet.add(r.service_id);
    }

    if (duplicates.length > 0) {
      throw new Error(`Duplicate service_id detected: ${duplicates.join(', ')}`);
    }
    console.log(`Integrity Check Passed: All ${idSet.size} service_ids are strictly unique.`);

    // Drop existing collection to ensure clean import
    const existingCollections = await db.listCollections({ name: collectionName }).toArray();
    if (existingCollections.length > 0) {
      console.log(`Collection "${collectionName}" already exists. Dropping existing records...`);
      await collection.drop();
      console.log(`Dropped old "${collectionName}" collection.`);
    }

    // Insert all 600 records
    const insertResult = await collection.insertMany(records);
    console.log(`Successfully inserted ${insertResult.insertedCount} documents into "${collectionName}".`);

    // Create unique index on service_id
    console.log(`Creating unique index on "service_id"...`);
    await collection.createIndex({ service_id: 1 }, { unique: true });
    console.log(`Unique index created on service_id.`);

    // Create supporting indexes for query & aggregation efficiency
    await collection.createIndex({ vehicle_brand: 1 });
    await collection.createIndex({ vehicle_type: 1 });
    await collection.createIndex({ service_date: 1 });
    await collection.createIndex({ maintenance_status: 1 });
    await collection.createIndex({ service_center: 1 });
    await collection.createIndex({ total_cost: 1 });
    console.log(`Supporting indexes created for vehicle_brand, vehicle_type, service_date, maintenance_status, service_center, total_cost.`);

    // Verification & Validation
    const count = await collection.countDocuments();
    console.log(`\n--- POST-IMPORT VERIFICATION ---`);
    console.log(`Total Documents in Collection: ${count}`);

    const sample = await collection.findOne({ service_id: 'VS0391' });
    console.log(`Sample Document (VS0391):`);
    console.log(JSON.stringify(sample, null, 2));

    console.log(`\nField Type Verification:`);
    console.log(`- service_id: ${typeof sample.service_id} (value: ${sample.service_id})`);
    console.log(`- service_date: ${sample.service_date instanceof Date ? 'Date' : typeof sample.service_date} (${sample.service_date.toISOString()})`);
    console.log(`- parts_cost: ${typeof sample.parts_cost} (value: ${sample.parts_cost})`);
    console.log(`- labor_cost: ${typeof sample.labor_cost} (value: ${sample.labor_cost})`);
    console.log(`- total_cost: ${typeof sample.total_cost} (value: ${sample.total_cost})`);
    console.log(`- odometer_km: ${typeof sample.odometer_km} (value: ${sample.odometer_km})`);

    const indexes = await collection.indexes();
    console.log(`\nCollection Indexes:`);
    indexes.forEach(idx => console.log(` - ${idx.name}: ${JSON.stringify(idx.key)} (unique: ${!!idx.unique})`));

    console.log(`\nImport and validation completed successfully!\n`);
  } catch (err) {
    console.error(`Import failed:`, err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  importDataset();
}

module.exports = { importDataset, parseCSV };
