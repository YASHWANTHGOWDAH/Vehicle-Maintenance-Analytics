const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'VehicleMaintenanceDB';
const collectionName = process.env.COLLECTION_NAME || 'service_records';

let client = null;
let db = null;
let dbMode = 'uninitialized'; // 'mongodb' or 'fallback'
let inMemoryRecords = [];
let fallbackCollection = null;

// Simple CSV parser for fallback mode
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    if (values.length !== headers.length) continue;

    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx]; });

    records.push({
      service_id: String(row.service_id).trim(),
      service_date: new Date(row.service_date + 'T00:00:00.000Z'),
      service_date_str: String(row.service_date).trim(),
      vehicle_type: String(row.vehicle_type).trim(),
      vehicle_brand: String(row.vehicle_brand).trim(),
      vehicle_model: String(row.vehicle_model).trim(),
      service_type: String(row.service_type).trim(),
      parts_cost: parseFloat(row.parts_cost) || 0,
      labor_cost: parseFloat(row.labor_cost) || 0,
      total_cost: parseFloat(row.total_cost) || 0,
      odometer_km: parseInt(row.odometer_km, 10) || 0,
      service_center: String(row.service_center).trim(),
      maintenance_status: String(row.maintenance_status).trim(),
      is_original: true
    });
  }
  return records;
}

function initFallbackCollection() {
  if (fallbackCollection) return fallbackCollection;

  // Locate CSV dataset
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'database', 'vehicle_service_maintenance_dataset.csv'),
    path.join(__dirname, '..', '..', 'vehicle_service_maintenance_dataset.csv'),
    path.join(process.cwd(), 'database', 'vehicle_service_maintenance_dataset.csv'),
    path.join(process.cwd(), 'vehicle_service_maintenance_dataset.csv')
  ];

  let csvPath = possiblePaths.find(p => fs.existsSync(p));
  if (csvPath) {
    const content = fs.readFileSync(csvPath, 'utf8');
    inMemoryRecords = parseCSV(content);
    console.log(`[Fallback DB] Loaded ${inMemoryRecords.length} records into in-memory collection from: ${csvPath}`);
  } else {
    console.warn('[Fallback DB] Warning: CSV dataset file not found in search paths.');
  }

  fallbackCollection = {
    async countDocuments(query = {}) {
      return (await this.find(query).toArray()).length;
    },

    async findOne(query = {}) {
      const results = await this.find(query).limit(1).toArray();
      return results[0] || null;
    },

    find(query = {}) {
      let filtered = inMemoryRecords.filter(r => {
        for (let [k, v] of Object.entries(query)) {
          if (k === '$or') {
            const matchAny = v.some(subQ => {
              for (let [subK, subV] of Object.entries(subQ)) {
                if (subV.$regex) {
                  const reg = new RegExp(subV.$regex, subV.$options || 'i');
                  if (reg.test(r[subK] || '')) return true;
                } else if (r[subK] === subV) {
                  return true;
                }
              }
              return false;
            });
            if (!matchAny) return false;
            continue;
          }

          if (v && typeof v === 'object') {
            if (v.$gt !== undefined && !(r[k] > v.$gt)) return false;
            if (v.$gte !== undefined && !(r[k] >= v.$gte)) return false;
            if (v.$lt !== undefined && !(r[k] < v.$lt)) return false;
            if (v.$lte !== undefined && !(r[k] <= v.$lte)) return false;
            if (v.$ne !== undefined && r[k] === v.$ne) return false;
          } else if (r[k] !== v) {
            return false;
          }
        }
        return true;
      });

      let sortField = null;
      let sortDir = 1;
      let skipCount = 0;
      let limitCount = Infinity;

      const cursor = {
        sort(sortObj) {
          if (sortObj) {
            const field = Object.keys(sortObj)[0];
            sortField = field;
            sortDir = sortObj[field];
          }
          return cursor;
        },
        skip(n) {
          skipCount = n;
          return cursor;
        },
        limit(n) {
          limitCount = n;
          return cursor;
        },
        async toArray() {
          let res = [...filtered];
          if (sortField) {
            res.sort((a, b) => {
              if (a[sortField] < b[sortField]) return -1 * sortDir;
              if (a[sortField] > b[sortField]) return 1 * sortDir;
              return 0;
            });
          }
          if (skipCount > 0) res = res.slice(skipCount);
          if (limitCount < Infinity) res = res.slice(0, limitCount);
          return res;
        }
      };
      return cursor;
    },

    async insertOne(doc) {
      const newDoc = { ...doc, _id: 'mem_' + Date.now() + Math.random().toString(36).substr(2, 5) };
      inMemoryRecords.push(newDoc);
      return { insertedId: newDoc._id };
    },

    async updateOne(query, update) {
      const idx = inMemoryRecords.findIndex(r => {
        return Object.entries(query).every(([k, v]) => r[k] === v);
      });
      if (idx !== -1 && update.$set) {
        inMemoryRecords[idx] = { ...inMemoryRecords[idx], ...update.$set };
        return { matchedCount: 1, modifiedCount: 1 };
      }
      return { matchedCount: 0, modifiedCount: 0 };
    },

    async deleteOne(query) {
      const idx = inMemoryRecords.findIndex(r => {
        return Object.entries(query).every(([k, v]) => {
          if (v && v.$ne !== undefined) return r[k] !== v.$ne;
          return r[k] === v;
        });
      });
      if (idx !== -1) {
        inMemoryRecords.splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },

    async deleteMany(query) {
      const before = inMemoryRecords.length;
      inMemoryRecords = inMemoryRecords.filter(r => {
        return !Object.entries(query).every(([k, v]) => r[k] === v);
      });
      return { deletedCount: before - inMemoryRecords.length };
    },

    async distinct(field) {
      const set = new Set();
      inMemoryRecords.forEach(r => {
        if (r[field]) set.add(r[field]);
      });
      return Array.from(set);
    },

    async createIndex() { return 'index_created'; },
    async indexes() { return [{ name: 'service_id_1', unique: true }]; },

    // In-memory Aggregation Pipeline Engine
    aggregate(pipeline) {
      return {
        async toArray() {
          const pStr = JSON.stringify(pipeline);

          // 1. Cost by vehicle type
          if (pStr.includes('$vehicle_type') && pStr.includes('totalRepairCost')) {
            const groups = {};
            inMemoryRecords.forEach(r => {
              const k = r.vehicle_type;
              if (!groups[k]) groups[k] = { vehicleType: k, serviceCount: 0, totalRepairCost: 0 };
              groups[k].serviceCount++;
              groups[k].totalRepairCost += r.total_cost;
            });
            return Object.values(groups).map(g => ({
              ...g,
              totalRepairCost: Math.round(g.totalRepairCost * 100) / 100,
              avgRepairCost: Math.round((g.totalRepairCost / g.serviceCount) * 100) / 100
            })).sort((a, b) => b.totalRepairCost - a.totalRepairCost);
          }

          // 2. Records by vehicle brand
          if (pStr.includes('$vehicle_brand') && !pStr.includes('brandCount')) {
            const groups = {};
            inMemoryRecords.forEach(r => {
              const k = r.vehicle_brand;
              if (!groups[k]) groups[k] = { brand: k, serviceCount: 0, totalCost: 0 };
              groups[k].serviceCount++;
              groups[k].totalCost += r.total_cost;
            });
            return Object.values(groups).map(g => ({
              ...g,
              totalCost: Math.round(g.totalCost * 100) / 100,
              avgCost: Math.round((g.totalCost / g.serviceCount) * 100) / 100
            })).sort((a, b) => b.serviceCount - a.serviceCount);
          }

          // 3. Most frequent services
          if (pStr.includes('$service_type') && pStr.includes('frequency')) {
            const groups = {};
            inMemoryRecords.forEach(r => {
              const k = r.service_type;
              if (!groups[k]) groups[k] = { serviceType: k, frequency: 0, totalRevenue: 0 };
              groups[k].frequency++;
              groups[k].totalRevenue += r.total_cost;
            });
            return Object.values(groups).map(g => ({
              ...g,
              totalRevenue: Math.round(g.totalRevenue * 100) / 100,
              avgCost: Math.round((g.totalRevenue / g.frequency) * 100) / 100
            })).sort((a, b) => b.frequency - a.frequency);
          }

          // 4. Monthly expenses
          if (pStr.includes('%Y-%m') || pStr.includes('monthlyExpense')) {
            const groups = {};
            inMemoryRecords.forEach(r => {
              const m = (r.service_date_str || (r.service_date instanceof Date ? r.service_date.toISOString().slice(0, 10) : '')).slice(0, 7);
              if (!m) return;
              if (!groups[m]) groups[m] = { month: m, monthlyExpense: 0, serviceCount: 0 };
              groups[m].monthlyExpense += r.total_cost;
              groups[m].serviceCount++;
            });
            return Object.values(groups).map(g => ({
              ...g,
              monthlyExpense: Math.round(g.monthlyExpense * 100) / 100,
              avgExpense: Math.round((g.monthlyExpense / g.serviceCount) * 100) / 100
            })).sort((a, b) => a.month.localeCompare(b.month));
          }

          // 5. Parts vs labor
          if (pStr.includes('totalPartsCost')) {
            let p = 0, l = 0, t = 0;
            inMemoryRecords.forEach(r => {
              p += r.parts_cost;
              l += r.labor_cost;
              t += r.total_cost;
            });
            p = Math.round(p * 100) / 100;
            l = Math.round(l * 100) / 100;
            t = Math.round(t * 100) / 100;
            return [{
              totalPartsCost: p,
              totalLaborCost: l,
              totalOverallCost: t,
              avgPartsCost: Math.round((p / inMemoryRecords.length) * 100) / 100,
              avgLaborCost: Math.round((l / inMemoryRecords.length) * 100) / 100,
              partsPercentage: Math.round((p / t) * 10000) / 100,
              laborPercentage: Math.round((l / t) * 10000) / 100,
              totalRecords: inMemoryRecords.length
            }];
          }

          // 6. Maintenance status distribution
          if (pStr.includes('$maintenance_status')) {
            const groups = {};
            inMemoryRecords.forEach(r => {
              const k = r.maintenance_status;
              if (!groups[k]) groups[k] = { status: k, count: 0, totalValue: 0 };
              groups[k].count++;
              groups[k].totalValue += r.total_cost;
            });
            return Object.values(groups).map(g => ({
              ...g,
              totalValue: Math.round(g.totalValue * 100) / 100,
              avgValue: Math.round((g.totalValue / g.count) * 100) / 100
            })).sort((a, b) => b.count - a.count);
          }

          // 7. Top 10 expensive
          if (pStr.includes('total_cost') && pStr.includes('10')) {
            const sorted = [...inMemoryRecords].sort((a, b) => b.total_cost - a.total_cost).slice(0, 10);
            return sorted.map(r => ({
              service_id: r.service_id,
              service_date: (r.service_date_str || r.service_date.toISOString().slice(0, 10)),
              vehicle: `${r.vehicle_brand} ${r.vehicle_model} (${r.vehicle_type})`,
              service_type: r.service_type,
              parts_cost: r.parts_cost,
              labor_cost: r.labor_cost,
              total_cost: r.total_cost,
              odometer_km: r.odometer_km,
              service_center: r.service_center,
              maintenance_status: r.maintenance_status
            }));
          }

          // 8. Service center performance
          if (pStr.includes('$service_center')) {
            const groups = {};
            inMemoryRecords.forEach(r => {
              const k = r.service_center;
              if (!groups[k]) groups[k] = { serviceCenter: k, totalServices: 0, totalRevenue: 0, totalOdo: 0 };
              groups[k].totalServices++;
              groups[k].totalRevenue += r.total_cost;
              groups[k].totalOdo += r.odometer_km;
            });
            return Object.values(groups).map(g => ({
              serviceCenter: g.serviceCenter,
              totalServices: g.totalServices,
              totalRevenue: Math.round(g.totalRevenue * 100) / 100,
              avgRepairCost: Math.round((g.totalRevenue / g.totalServices) * 100) / 100,
              avgOdometer: Math.round(g.totalOdo / g.totalServices)
            })).sort((a, b) => b.totalServices - a.totalServices);
          }

          // Brand count query for KPI
          if (pStr.includes('brandCount')) {
            const brands = new Set(inMemoryRecords.map(r => r.vehicle_brand));
            return [{ brandCount: brands.size }];
          }

          // Common service query for KPI
          if (pStr.includes('$service_type') && pStr.includes('count: -1')) {
            const counts = {};
            inMemoryRecords.forEach(r => counts[r.service_type] = (counts[r.service_type] || 0) + 1);
            let topType = 'General Service', maxC = 0;
            for (let [st, cnt] of Object.entries(counts)) {
              if (cnt > maxC) { maxC = cnt; topType = st; }
            }
            return [{ _id: topType, count: maxC }];
          }

          // General KPI summary
          if (pStr.includes('totalExpenses')) {
            let p = 0, l = 0, t = 0, o = 0;
            inMemoryRecords.forEach(r => {
              p += r.parts_cost;
              l += r.labor_cost;
              t += r.total_cost;
              o += r.odometer_km;
            });
            return [{
              totalRecords: inMemoryRecords.length,
              totalExpenses: t,
              avgCost: inMemoryRecords.length ? t / inMemoryRecords.length : 0,
              totalPartsCost: p,
              totalLaborCost: l,
              avgOdometer: inMemoryRecords.length ? o / inMemoryRecords.length : 0
            }];
          }

          return inMemoryRecords.slice(0, 10);
        }
      };
    }
  };

  return fallbackCollection;
}

async function connectDB() {
  if (db && dbMode === 'mongodb') return db;

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2500, // fast timeout for serverless environments
      connectTimeoutMS: 2500
    });
    await client.connect();
    db = client.db(dbName);
    dbMode = 'mongodb';
    console.log(`[Database] Successfully connected to live MongoDB: "${dbName}"`);
    return db;
  } catch (error) {
    console.warn(`[Database] Live MongoDB connection unavailable (${error.message}).`);
    console.log(`[Database] Activating Cloud / In-Memory dataset mode...`);
    dbMode = 'fallback';
    initFallbackCollection();
    return null;
  }
}

function getDB() {
  if (dbMode === 'mongodb' && db) return db;
  return null;
}

function getCollection() {
  if (dbMode === 'mongodb' && db) {
    return db.collection(collectionName);
  }
  return initFallbackCollection();
}

function getDBMode() {
  return dbMode;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    dbMode = 'uninitialized';
  }
}

module.exports = {
  connectDB,
  getDB,
  getCollection,
  getDBMode,
  closeDB,
  dbName,
  collectionName,
  uri
};
