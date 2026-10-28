# Vehicle Service and Maintenance Analytics Using MongoDB

A complete, full-stack academic database project demonstrating real-world vehicle service center operations, repair cost analysis, maintenance frequency metrics, and advanced aggregation pipelines using **MongoDB Community Server**, **Node.js**, **Express.js**, and **Chart.js**.

---

## 📌 Project Overview

- **Title:** Vehicle Service and Maintenance Analytics Using MongoDB
- **Target Database:** `VehicleMaintenanceDB`
- **Collection Name:** `service_records`
- **Primary Dataset:** `vehicle_service_maintenance_dataset.csv` (600 Synthetic Academic Records, 12 Attributes)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Chart.js 4.4
- **Backend:** Node.js 25.9, Express.js 4.19, MongoDB Node.js Driver 6.8
- **Submission Deadline:** 29 October 2026

---

## 🚀 Key Features

1. **Complete Database Modeling & Unique Indexing:**
   - Enforces unique constraint on `service_id`.
   - Numeric type coercion for `parts_cost`, `labor_cost`, `total_cost`, and `odometer_km`.
   - BSON Date handling for time-series and monthly aggregations.
   - Supporting indexes on `vehicle_brand`, `vehicle_type`, `service_date`, `maintenance_status`, `service_center`, and `total_cost`.

2. **Full CRUD Operations with Academic Shield:**
   - **Create:** Insert new service records with validation.
   - **Read:** Retrieve records with multi-attribute filtering, search, pagination, and multi-field sorting.
   - **Update:** Modify existing records (costs, status, technician notes).
   - **Delete:** Safe deletion of test records with an **Academic Shield** preventing accidental deletion of the original 600 benchmark records.

3. **8 MongoDB Aggregation Pipelines:**
   1. Total & average repair cost by vehicle type (`$group`, `$avg`, `$sum`, `$sort`).
   2. Number of service records by vehicle brand.
   3. Most frequent service types and average ticket sizes.
   4. Monthly maintenance expenses timeline (`$dateToString`, `$group`).
   5. Total parts cost versus labor cost ratio (`$group`, `$project`).
   6. Maintenance status distribution (Completed, In Progress, Pending).
   7. Top 10 most expensive repairs (`$sort`, `$limit`, `$project`).
   8. Service center performance across 6 Bangalore facilities.

4. **Responsive Visual Analytics Dashboard:**
   - Dynamic KPI summary cards (Total Records, Gross Expenses, Average Cost, Brand Count, Top Service).
   - Interactive charts (Doughnut, Bar, Horizontal Bar, Line).
   - Searchable, paginated data table showing all 12 dataset fields with search and multi-attribute filters.
   - Dedicated Analytics tab displaying visualizations and comparison tables for all 8 MongoDB aggregation pipelines.

---

## 📂 Project Directory Structure

```
vehicle-service-maintenance-analytics/
├── client/
│   ├── index.html                  # Responsive Single-Page Application (SPA)
│   ├── style.css                   # Automotive UI styles, KPI cards & tables
│   └── script.js                   # Client API controller & Chart.js engine
├── server/
│   ├── config/
│   │   └── db.js                   # MongoDB connection manager & pooling
│   ├── controllers/
│   │   ├── recordController.js     # CRUD, search, filter, and pagination logic
│   │   └── analyticsController.js  # Aggregation pipeline API endpoints
│   ├── routes/
│   │   ├── recordRoutes.js         # /api/records endpoints
│   │   └── analyticsRoutes.js      # /api/analytics endpoints
│   ├── server.js                   # Express application entrypoint
│   └── test_api.js                 # Automated REST API test suite
├── database/
│   ├── vehicle_service_maintenance_dataset.csv # Primary benchmark dataset (600 records)
│   ├── import.js                   # Dataset importer, validator & index builder
│   ├── queries.js                  # Search, filter & CRUD demonstration script
│   └── aggregations.js             # 8 MongoDB aggregation pipeline drivers
├── screenshots/
│   └── screenshot_guide.md         # Capture instructions & verification checklist
├── report/
│   └── academic_project_report.md  # Comprehensive 15-section project report
├── .env.example                    # Environment variable template
├── .env                            # Active configuration file
├── .gitignore                      # Git exclusion rules
├── README.md                       # Comprehensive project documentation
└── package.json                    # Project dependencies and npm scripts
```

---

## ⚙️ Installation & Setup Guide

### Prerequisites
- **Node.js** (v18 or higher; tested on v25.9)
- **npm** (v9 or higher)
- **MongoDB Community Server** (v6.0, v7.0, or v8.0+; tested on v8.2)
- **MongoDB Compass** (optional, recommended for visual inspection)
- **MongoDB Shell (`mongosh`)** (optional, for CLI verification)

---

### Step 1: Clone or Navigate to Project Directory
```powershell
cd "c:\Vehicle Maintenance Analytics – Service History, Costs, and Frequency"
```

### Step 2: Install Node.js Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Verify or edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=VehicleMaintenanceDB
COLLECTION_NAME=service_records
```

### Step 4: Start MongoDB Server
If MongoDB is not already running as a Windows service, start `mongod`:
```powershell
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath database\data --port 27017 --bind_ip 127.0.0.1
```

### Step 5: Import the Benchmark Dataset
Run the custom importer script to parse `vehicle_service_maintenance_dataset.csv`, create indexes, and validate all 600 records:
```bash
npm run db:import
```
*Expected Console Output:*
```
Parsed 600 records from CSV.
Integrity Check Passed: All 600 service_ids are strictly unique.
Successfully inserted 600 documents into "service_records".
Unique index created on service_id.
Total Documents in Collection: 600
```

*Alternative (MongoDB `mongoimport` CLI):*
```powershell
mongoimport --db=VehicleMaintenanceDB --collection=service_records --type=csv --headerline --file=database/vehicle_service_maintenance_dataset.csv
```

### Step 6: Run Queries and CRUD Demonstrations
Execute the automated query suite:
```bash
npm run db:queries
```
This demonstrates:
- Inserting test record `VS-TEST-9999`
- Reading test record
- Updating test record
- Safe deletion with Academic Shield check
- Search by ID (`VS0391`)
- Filtering by Brand (`Toyota`) and Type (`Motorcycle`)
- Range queries (Repairs > ₹18,000, 2024-Q1 dates)
- Compound filters and sorting

### Step 7: Run Aggregation Pipelines
Execute all 8 aggregation pipelines from the command line:
```bash
npm run db:aggregations
```
Displays formatted console tables for all 8 analytical questions.

### Step 8: Start the Web Application
```bash
npm start
```
*Console output:*
```
🚀 Server listening on http://localhost:5000
📊 Dashboard UI:   http://localhost:5000
🔗 API Base URL:   http://localhost:5000/api/records
```

### Step 9: Open the Dashboard
Open your web browser and navigate to:
**[http://localhost:5000](http://localhost:5000)**

---

## 📊 Summary of Actual Aggregation Findings

Based on the verified run over the 600 benchmark records:

1. **Total Fleet Spend:** **₹3,977,510.54** (Average Ticket: **₹6,629.18**).
2. **Parts vs. Labor Ratio:**
   - **Parts Cost:** ₹2,368,993.25 (**59.56%**)
   - **Labor Cost:** ₹1,608,517.29 (**40.44%**)
3. **Most Frequent Maintenance:** **General Service** (74 jobs), followed by **Battery Replacement** (68 jobs) and **Brake Repair** (67 jobs).
4. **Highest Cost Category:** **Engine Repair** (Average cost: **₹18,593.67**; peak repair: **₹28,909.73** on Bajaj Pulsar).
5. **Highest Volume Brand:** **Tata** (76 jobs, ₹5.20L) tied with **Maruti Suzuki** (76 jobs, ₹4.81L).
6. **Service Center Workload:** Well balanced across Bangalore:
   - Whitefield Auto Care: 109 jobs (₹6.30L revenue)
   - Hebbal Motors: 107 jobs (₹7.07L revenue)
   - Bengaluru Central: 101 jobs (₹6.13L revenue)
   - Electronic City Garage: 98 jobs (₹7.38L revenue, highest avg ticket: ₹7,525.83)
   - Mysuru Road Service: 94 jobs (₹6.42L revenue)
   - Yelahanka Service Hub: 91 jobs (₹6.47L revenue)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status and total document count in MongoDB |
| `GET` | `/api/stats` | KPI summary statistics for the main dashboard |
| `GET` | `/api/records` | Paginated records with search, filtering, and sorting |
| `GET` | `/api/records/:id` | Fetch single record by unique `service_id` |
| `POST` | `/api/records` | Insert a new service record (validated) |
| `PUT` | `/api/records/:id` | Update an existing service record |
| `DELETE` | `/api/records/:id` | Delete test record (Academic Shield blocks original records) |
| `GET` | `/api/records/options` | Dynamic dropdown lists for brands, types, services, etc. |
| `GET` | `/api/analytics/all` | Combined payload of all 8 aggregation pipelines |
| `GET` | `/api/analytics/cost-by-vehicle-type` | Pipeline 1: Costs grouped by vehicle category |
| `GET` | `/api/analytics/records-by-brand` | Pipeline 2: Volume & expenses by brand |
| `GET` | `/api/analytics/frequent-services` | Pipeline 3: Most common maintenance types |
| `GET` | `/api/analytics/monthly-expenses` | Pipeline 4: Monthly expenditure timeline |
| `GET` | `/api/analytics/parts-vs-labor` | Pipeline 5: Parts vs labor ratio |
| `GET` | `/api/analytics/status-distribution` | Pipeline 6: Job status distribution |
| `GET` | `/api/analytics/top-expensive` | Pipeline 7: Top 10 most expensive repairs |
| `GET` | `/api/analytics/service-centers` | Pipeline 8: Service center performance metrics |

---

## 🧪 Automated Testing

An automated test script is provided in `server/test_api.js` to verify all 9 API operations, including the deletion protection mechanism:
```bash
node server/test_api.js
```

---

## 🎓 College Viva & Evaluation Tips

- **Why MongoDB?** Explain that automotive service records vary across vehicle types (e.g., 2-wheelers lack AC repairs; electric/hybrid vehicles have battery telemetry). A schema-flexible document store handles this naturally.
- **Aggregation vs SQL GROUP BY:** Explain that MongoDB aggregation pipelines execute multi-stage stream transformations directly in-memory using native database operators (`$match`, `$group`, `$sort`, `$project`).
- **Academic Dataset Preservation:** Highlight that `is_original: true` prevents accidental deletion of benchmark records while allowing live CRUD demonstrations with test records.

---

## 📄 License & Attribution

This project is developed for academic evaluation purposes based on synthetic vehicle maintenance data.
Released under the MIT License.
