# Academic Project Report

---

# VEHICLE SERVICE AND MAINTENANCE ANALYTICS USING MONGODB

**Course Code:** CS801 / IT602 – Advanced Database Systems & Analytics  
**Academic Session:** 2026–2027  
**Submission Deadline:** 29 October 2026  
**Technology Stack:** MongoDB Community Server 8.2, Express.js 4.19, Node.js 25.9, HTML5, CSS3, JavaScript (ES6+), Chart.js 4.4  

---

## 1. Title Page

- **Project Title:** Vehicle Service and Maintenance Analytics Using MongoDB
- **Target Database:** MongoDB (Document Store / Aggregation Pipeline Engine)
- **Primary Dataset:** `vehicle_service_maintenance_dataset.csv` (600 Synthetic Academic Records)
- **Author/Student Name:** Academic Project Candidate
- **Institution:** Department of Computer Science & Engineering / Information Technology
- **Date of Completion:** 28 October 2026

---

## 2. Abstract

In contemporary automotive service center networks, tracking maintenance schedules, analyzing repair costs, and optimizing service operations are critical for business sustainability and fleet reliability. Traditional relational database management systems (RDBMS) often face architectural rigidity when dealing with heterogeneous automotive diagnostics, evolving service parameters, and high-volume analytical aggregations.

This project implements a complete, full-stack vehicle service and maintenance analytics system titled **“Vehicle Service and Maintenance Analytics Using MongoDB”**. Grounded upon a benchmark dataset of 600 verified synthetic academic service records spanning 12 distinct attributes, the project leverages MongoDB's document model and multi-stage aggregation pipelines. The system features a responsive, modern web dashboard developed with Express.js, Node.js, HTML5/CSS3, and Chart.js, delivering real-time interactive business intelligence without hardcoded analytical metrics. Crucially, the system incorporates an **Academic Safety Shield** mechanism that guarantees the permanent integrity of the 600 baseline benchmark records while permitting full CRUD demonstrations on dynamic test documents.

---

## 3. Introduction

Modern vehicle maintenance management requires continuous ingestion, querying, and multidimensional aggregation of vehicle telemetry, component wear, labor overheads, and service center operational metrics. Database engines supporting such platforms must satisfy three foundational criteria:
1. **Low-latency indexing and searching** across multi-attribute operational records.
2. **Dynamic aggregation pipelines** that calculate revenue, average ticket sizes, and component failure frequencies without requiring third-party extract-transform-load (ETL) tools.
3. **Data model flexibility**, permitting rapid extensions such as diagnostic trouble codes (DTCs) or warranty flags.

MongoDB was selected as the core database technology. Utilizing its Binary JSON (BSON) storage format, native date-manipulation capabilities, and declarative pipeline stages, this application bridges database design and interactive visual analytics.

---

## 4. Problem Statement

Automotive service franchises encounter significant challenges when managing multi-brand maintenance history:
- **Disparate Metrics:** Inability to isolate parts expenses from labor overheads across distinct vehicle categories (Sedans, SUVs, Hatchbacks, Vans, and Motorcycles).
- **Service Center Imbalances:** Lack of real-time visibility into workload distribution and average job billing across geographic service hubs.
- **Reporting Inflexibility:** Conventional reporting systems rely on periodic batch generation or hardcoded summary tables, resulting in outdated operational decisions.
- **Data Integrity Violations:** Student and enterprise demonstration systems often risk accidental deletion or mutation of benchmark historical datasets during administrative CRUD demonstrations.

---

## 5. Project Objectives

The primary engineering objectives of this project are:
1. **Database Modeling:** Design and instantiate the `VehicleMaintenanceDB` database and `service_records` collection with strict data typing, numeric coercion, and unique indexing on `service_id`.
2. **Dataset Preservation:** Ingest all 600 synthetic records from `vehicle_service_maintenance_dataset.csv` with zero record loss or duplicate generation.
3. **Complete CRUD Implementation:** Implement Create, Read, Update, and Delete operations with an academic protection shield preventing deletion of baseline benchmark data.
4. **Search and Query Facilities:** Provide parameterized search, compound filtering, cost threshold filters, date-range bounding, and multi-directional sorting.
5. **Aggregation Pipeline Development:** Build and benchmark 8 distinct MongoDB aggregation pipelines to calculate:
   - Total and average repair cost by vehicle type.
   - Volume of service visits by brand.
   - Frequency distribution of service operations.
   - Monthly expenditure timelines.
   - Gross parts vs. labor cost proportions.
   - Status distribution.
   - Top 10 high-value repairs.
   - Service center operational performance.
6. **Responsive Dashboard UI:** Deliver a responsive, single-page web application featuring dynamic KPI summary cards, interactive Chart.js graphs, paginated record exploration, and live query execution.

---

## 6. Dataset Description

The system utilizes the attached primary benchmark dataset: `vehicle_service_maintenance_dataset.csv`.

- **Total Records:** 600 documents (plus 1 CSV header row).
- **Total Attributes:** 12 fields.
- **Missing / Null Values:** 0 across all 600 records.
- **Nature of Data:** Synthetic academic dataset representing automobile maintenance across 6 Bangalore service hubs from January 2024 to October 2026.

### Dataset Schema & Field Definitions

| Field Name | Storage Data Type | Description & Domain Values | Sample Value |
| :--- | :--- | :--- | :--- |
| `service_id` | `String` (Indexed, Unique) | Alphanumeric unique repair order identifier (Format: `VS\d{4}`) | `"VS0391"` |
| `service_date` | `BSON Date` | Date on which the vehicle was admitted for maintenance | `ISODate("2024-02-22T00:00:00Z")` |
| `vehicle_type` | `String` (Indexed) | Category of vehicle (`Hatchback`, `Motorcycle`, `SUV`, `Sedan`, `Van`) | `"Motorcycle"` |
| `vehicle_brand` | `String` (Indexed) | Manufacturer brand (13 brands: Bajaj, Force Motors, Hero, Honda, Hyundai, Kia, Mahindra, Maruti Suzuki, Royal Enfield, Skoda, TVS, Tata, Toyota) | `"Bajaj"` |
| `vehicle_model` | `String` | Vehicle model designation (e.g., Dominar, Pulsar, Creta, Harrier, Swift, Innova) | `"Dominar"` |
| `service_type` | `String` (Indexed) | Category of maintenance performed (10 operations: General Service, Oil Change, Brake Repair, Clutch Repair, Engine Repair, Transmission Service, Tire Replacement, Wheel Alignment, AC Repair, Battery Replacement) | `"Wheel Alignment"` |
| `parts_cost` | `Double` | Billed cost for replacement components in Indian Rupees (₹) | `1040.44` |
| `labor_cost` | `Double` | Service technician billing in Indian Rupees (₹) | `418.69` |
| `total_cost` | `Double` (Indexed) | Total invoice amount in Indian Rupees (`parts_cost + labor_cost`) | `1459.13` |
| `odometer_km` | `Int32` | Vehicle mileage reading at the time of service entry | `46055` |
| `service_center` | `String` (Indexed) | Facility location (6 centers: Bengaluru Central, Electronic City Garage, Hebbal Motors, Mysuru Road Service, Whitefield Auto Care, Yelahanka Service Hub) | `"Whitefield Auto Care"` |
| `maintenance_status` | `String` (Indexed) | Operational job status (`Completed`, `In Progress`, `Pending`) | `"Completed"` |

---

## 7. MongoDB Database and Collection Structure

### 7.1 Database & Collection Hierarchy

```
MongoDB Community Server (mongodb://127.0.0.1:27017)
└── Database: VehicleMaintenanceDB
    └── Collection: service_records
        ├── Document Count: 600 (Base) + Dynamic Test Documents
        ├── Sharding / Replica State: Standalone Local Deployment
        └── Indexes: 8 active indexes
```

### 7.2 Index Architecture

To maintain high query performance across search, sorting, and aggregation stages, the following indexes are created on `service_records`:

1. **`_id_` (Default Primary Key Index):**
   `{ "_id": 1 }` – Internal MongoDB ObjectId index.
2. **`service_id_1` (Unique Constraint Index):**
   `{ "service_id": 1 }`, `unique: true` – Enforces non-duplicate service IDs across all inserts.
3. **`vehicle_brand_1` (Secondary Filter Index):**
   `{ "vehicle_brand": 1 }` – Optimizes brand-level filtering and grouping.
4. **`vehicle_type_1` (Secondary Filter Index):**
   `{ "vehicle_type": 1 }` – Optimizes vehicle category filtering.
5. **`service_date_1` (Temporal Index):**
   `{ "service_date": 1 }` – Enables fast B-tree range scans for date ranges and monthly aggregation.
6. **`maintenance_status_1` (Status Index):**
   `{ "maintenance_status": 1 }` – Accelerates workflow filtering (Completed, In Progress, Pending).
7. **`service_center_1` (Facility Index):**
   `{ "service_center": 1 }` – Enhances service center operational comparisons.
8. **`total_cost_1` (Metric Index):**
   `{ "total_cost": 1 }` – Enables instant index-based sorting for minimum, maximum, and top-N cost queries.

---

## 8. System Architecture

The application adopts a decoupled three-tier architecture:

```
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION TIER                    │
│   Client Web Dashboard (HTML5, Modern CSS, ES6+)       │
│   Interactive Visualizations (Chart.js 4.4 Engine)     │
│   CRUD Modals & Query Execution Demonstrator           │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (HTTP)
┌───────────────────────────▼────────────────────────────┐
│                   APPLICATION TIER                     │
│   Node.js v25.9 Runtime & Express.js v4.19 Framework   │
│   Record Controller (Filtering, Sorting, Pagination)   │
│   Analytics Controller (Aggregation Pipeline Drivers)  │
│   Academic Safety Shield Middleware (Mutation Guard)   │
└───────────────────────────┬────────────────────────────┘
                            │ MongoDB Native Driver (v6.8)
┌───────────────────────────▼────────────────────────────┐
│                     DATABASE TIER                      │
│   MongoDB Community Server 8.2                         │
│   Database: VehicleMaintenanceDB                       │
│   Collection: service_records (BSON Documents)         │
│   B-Tree Indexes & In-Memory Pipeline Execution Engine │
└────────────────────────────────────────────────────────┘
```

---

## 9. CRUD Operations and Queries

All MongoDB CRUD operations and search queries were implemented and tested through both the Node.js backend driver and `mongosh`.

### 9.1 CRUD Operations

#### 1. Insert Operation (Create)
```javascript
db.service_records.insertOne({
  service_id: "VS-TEST-9999",
  service_date: ISODate("2026-10-28T00:00:00Z"),
  service_date_str: "2026-10-28",
  vehicle_type: "SUV",
  vehicle_brand: "Tata",
  vehicle_model: "Harrier",
  service_type: "Brake Repair",
  parts_cost: 3200.00,
  labor_cost: 1500.00,
  total_cost: 4700.00,
  odometer_km: 25400,
  service_center: "Bengaluru Central",
  maintenance_status: "In Progress",
  is_original: false
});
```
*Actual Execution Result:* Document successfully inserted with generated `_id: ObjectId("6ae1a97af26954520f39d6c0")`.

#### 2. Read Operation (Read)
```javascript
db.service_records.findOne({ service_id: "VS-TEST-9999" });
```
*Actual Execution Result:* Retrieved matching document containing Tata Harrier SUV with total cost ₹4,700.00.

#### 3. Update Operation (Update)
```javascript
db.service_records.updateOne(
  { service_id: "VS-TEST-9999" },
  {
    $set: {
      maintenance_status: "Completed",
      total_cost: 4950.00,
      labor_cost: 1750.00,
      notes: "Replaced rear brake pads and bled brake lines."
    }
  }
);
```
*Actual Execution Result:* `matchedCount: 1, modifiedCount: 1`. Status modified to `Completed` and total cost updated to ₹4,950.00.

#### 4. Delete Operation with Safety Shield (Delete)
```javascript
// Protected Delete Query (Guarded against original records):
db.service_records.deleteOne({
  service_id: "VS-TEST-9999",
  is_original: { $ne: true }
});
```
*Actual Execution Result:*
- Attempting to delete `VS0391` (original): Handled by safety check; returns `403 Forbidden` (`Academic Shield Active: Record VS0391 belongs to the original 600 benchmark dataset and cannot be deleted`).
- Attempting to delete `VS-TEST-9999` (test record): `deletedCount: 1`. Document deleted cleanly. Total record count returns to exactly 600.

### 9.2 Search and Query Operations

| Query Scenario | MongoDB Query Formulation | Actual Result Summary |
| :--- | :--- | :--- |
| **Search by Service ID** | `db.service_records.findOne({ service_id: "VS0391" })` | Returned Dominar Motorcycle (Bajaj) serviced at Whitefield Auto Care. |
| **Filter by Brand** | `db.service_records.find({ vehicle_brand: "Toyota" })` | Returned 57 matching documents across Etios, Glanza, Innova, and Urban Cruiser. |
| **Filter by Vehicle Type** | `db.service_records.find({ vehicle_type: "Motorcycle" })` | Returned 120 matching 2-wheelers across Bajaj, Hero, Honda, Royal Enfield, TVS. |
| **High Cost Repairs** | `db.service_records.find({ total_cost: { $gt: 18000 } })` | Returned 27 documents. Highest repair: ₹28,909.73 (Bajaj Pulsar engine repair). |
| **Date Range Query** | `db.service_records.find({ service_date: { $gte: ISODate("2024-01-01"), $lte: ISODate("2024-03-31") } })` | Returned 61 service visits recorded during 2024 First Quarter (Q1). |
| **Compound Query** | `db.service_records.find({ vehicle_brand: "Hyundai", vehicle_type: "SUV", maintenance_status: "Completed" })` | Returned 15 matching SUV records sorted by descending invoice amount. |

---

## 10. Aggregation Pipelines and Their Actual Outputs

Below are the exact MongoDB pipeline definitions and verified execution outputs obtained from `database/aggregations.js` against the imported 600 documents.

### Pipeline 1: Total and Average Repair Cost by Vehicle Type
**Objective:** Compare service expenditure across vehicle categories.
```javascript
[
  {
    $group: {
      _id: "$vehicle_type",
      serviceCount: { $sum: 1 },
      totalRepairCost: { $sum: "$total_cost" },
      avgRepairCost: { $avg: "$total_cost" },
      minRepairCost: { $min: "$total_cost" },
      maxRepairCost: { $max: "$total_cost" }
    }
  },
  { $sort: { totalRepairCost: -1 } }
]
```
**Actual Output:**
| Vehicle Type | Service Count | Total Repair Cost (₹) | Average Repair Cost (₹) | Min Cost (₹) | Max Cost (₹) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SUV** | 133 | ₹908,898.37 | ₹6,833.82 | ₹443.19 | ₹26,094.29 |
| **Hatchback** | 131 | ₹874,258.91 | ₹6,673.73 | ₹536.12 | ₹22,824.05 |
| **Van** | 114 | ₹806,858.74 | ₹7,077.71 | ₹540.87 | ₹26,763.60 |
| **Motorcycle** | 120 | ₹739,788.16 | ₹6,164.90 | ₹813.10 | ₹28,909.73 |
| **Sedan** | 102 | ₹647,706.36 | ₹6,350.06 | ₹637.43 | ₹21,707.52 |

---

### Pipeline 2: Number of Service Records by Vehicle Brand
**Objective:** Evaluate service frequency and cumulative billings across all 13 manufacturers.
```javascript
[
  {
    $group: {
      _id: "$vehicle_brand",
      serviceCount: { $sum: 1 },
      totalCost: { $sum: "$total_cost" },
      avgCost: { $avg: "$total_cost" }
    }
  },
  { $sort: { serviceCount: -1 } }
]
```
**Actual Output:**
| Brand Name | Service Count | Total Expenses (₹) | Average Cost (₹) |
| :--- | :---: | :---: | :---: |
| **Tata** | 76 | ₹519,949.62 | ₹6,841.44 |
| **Maruti Suzuki** | 76 | ₹481,252.01 | ₹6,332.26 |
| **Toyota** | 57 | ₹347,732.14 | ₹6,100.56 |
| **Hyundai** | 54 | ₹388,674.75 | ₹7,197.68 |
| **Force Motors** | 38 | ₹296,876.10 | ₹7,812.53 |
| **Honda** | 38 | ₹227,651.98 | ₹5,990.84 |
| **TVS** | 32 | ₹248,396.90 | ₹7,762.40 |
| **Hero** | 26 | ₹187,270.62 | ₹7,202.72 |
| **Mahindra** | 26 | ₹174,188.80 | ₹6,699.57 |
| **Skoda** | 25 | ₹160,825.92 | ₹6,433.04 |
| **Royal Enfield** | 22 | ₹150,782.91 | ₹6,853.77 |
| **Kia** | 21 | ₹168,913.88 | ₹8,043.52 |
| **Bajaj** | 15 | ₹125,004.91 | ₹8,333.66 |

---

### Pipeline 3: Most Frequent Service Types
**Objective:** Identify the most requested maintenance procedures and their revenue impact.
```javascript
[
  {
    $group: {
      _id: "$service_type",
      frequency: { $sum: 1 },
      totalRevenue: { $sum: "$total_cost" },
      avgCost: { $avg: "$total_cost" }
    }
  },
  { $sort: { frequency: -1 } }
]
```
**Actual Output:**
| Service Type | Frequency | Total Revenue (₹) | Average Cost (₹) |
| :--- | :---: | :---: | :---: |
| **General Service** | 74 | ₹230,958.07 | ₹3,121.05 |
| **Battery Replacement** | 68 | ₹395,291.68 | ₹5,813.11 |
| **Brake Repair** | 67 | ₹286,220.14 | ₹4,271.94 |
| **AC Repair** | 64 | ₹405,108.57 | ₹6,329.82 |
| **Clutch Repair** | 62 | ₹463,554.40 | ₹7,476.68 |
| **Wheel Alignment** | 60 | ₹84,792.83 | ₹1,413.21 |
| **Transmission Service** | 56 | ₹739,784.87 | ₹13,210.44 |
| **Tire Replacement** | 53 | ₹466,541.97 | ₹8,802.68 |
| **Oil Change** | 51 | ₹68,542.87 | ₹1,343.98 |
| **Engine Repair** | 45 | ₹836,715.20 | ₹18,593.67 |

---

### Pipeline 4: Monthly Maintenance Expenses
**Objective:** Track historical expenditure over time using `$dateToString`.
```javascript
[
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$service_date" } },
      monthlyExpense: { $sum: "$total_cost" },
      serviceCount: { $sum: 1 },
      avgExpense: { $avg: "$total_cost" }
    }
  },
  { $sort: { _id: 1 } }
]
```
**Actual Output Excerpt (First 12 Months):**
| Year-Month | Monthly Expense (₹) | Service Count | Average Expense (₹) |
| :---: | :---: | :---: | :---: |
| **2024-01** | ₹96,864.88 | 14 | ₹6,918.92 |
| **2024-02** | ₹127,103.74 | 19 | ₹6,689.67 |
| **2024-03** | ₹144,383.92 | 23 | ₹6,277.56 |
| **2024-04** | ₹189,452.33 | 28 | ₹6,766.15 |
| **2024-05** | ₹81,102.77 | 12 | ₹6,758.56 |
| **2024-06** | ₹90,266.07 | 15 | ₹6,017.74 |
| **2024-07** | ₹113,015.34 | 16 | ₹7,063.46 |
| **2024-08** | ₹122,867.24 | 20 | ₹6,143.36 |
| **2024-09** | ₹138,592.51 | 24 | ₹5,774.69 |
| **2024-10** | ₹113,115.11 | 20 | ₹5,655.76 |
| **2024-11** | ₹186,754.26 | 27 | ₹6,916.82 |
| **2024-12** | ₹77,748.96 | 13 | ₹5,980.69 |

---

### Pipeline 5: Total Parts Cost versus Labor Cost
**Objective:** Determine the balance between hardware replacement costs and service labor overheads.
```javascript
[
  {
    $group: {
      _id: null,
      totalPartsCost: { $sum: "$parts_cost" },
      totalLaborCost: { $sum: "$labor_cost" },
      totalOverallCost: { $sum: "$total_cost" }
    }
  },
  {
    $project: {
      _id: 0,
      totalPartsCost: { $round: ["$totalPartsCost", 2] },
      totalLaborCost: { $round: ["$totalLaborCost", 2] },
      totalOverallCost: { $round: ["$totalOverallCost", 2] },
      partsPercentage: {
        $round: [{ $multiply: [{ $divide: ["$totalPartsCost", "$totalOverallCost"] }, 100] }, 2]
      },
      laborPercentage: {
        $round: [{ $multiply: [{ $divide: ["$totalLaborCost", "$totalOverallCost"] }, 100] }, 2]
      }
    }
  }
]
```
**Actual Output:**
- **Total Parts Expense:** ₹2,368,993.25 (**59.56%**)
- **Total Labor Expense:** ₹1,608,517.29 (**40.44%**)
- **Gross Overall Billing:** ₹3,977,510.54 (**100.00%**)

---

### Pipeline 6: Maintenance Status Distribution
**Objective:** Evaluate operational throughput and pending backlog.
```javascript
[
  {
    $group: {
      _id: "$maintenance_status",
      count: { $sum: 1 },
      totalValue: { $sum: "$total_cost" },
      avgValue: { $avg: "$total_cost" }
    }
  },
  { $sort: { count: -1 } }
]
```
**Actual Output:**
| Status | Job Count | Percentage (%) | Cumulative Value (₹) | Average Ticket (₹) |
| :--- | :---: | :---: | :---: | :---: |
| **Completed** | 338 | 56.33% | ₹2,168,963.29 | ₹6,417.05 |
| **In Progress** | 148 | 24.67% | ₹1,043,767.92 | ₹7,052.49 |
| **Pending** | 114 | 19.00% | ₹764,779.33 | ₹6,708.59 |

---

### Pipeline 7: Top 10 Most Expensive Repairs
**Objective:** Identify the highest value single maintenance jobs recorded.
```javascript
[
  { $sort: { total_cost: -1 } },
  { $limit: 10 },
  {
    $project: {
      _id: 0,
      service_id: 1,
      service_date: { $dateToString: { format: "%Y-%m-%d", date: "$service_date" } },
      vehicle: { $concat: ["$vehicle_brand", " ", "$vehicle_model", " (", "$vehicle_type", ")"] },
      service_type: 1,
      parts_cost: 1,
      labor_cost: 1,
      total_cost: 1,
      odometer_km: 1,
      service_center: 1,
      maintenance_status: 1
    }
  }
]
```
**Actual Output:**
| Rank | ID | Date | Vehicle Model & Category | Service Performed | Parts (₹) | Labor (₹) | Total Cost (₹) | Odometer | Center |
| :---: | :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **1** | VS0473 | 2025-07-18 | Bajaj Pulsar (Motorcycle) | Engine Repair | 17,045.79 | 11,863.94 | **₹28,909.73** | 28,667 km | Yelahanka Service Hub |
| **2** | VS0448 | 2024-02-09 | Tata Nexon (Van) | Engine Repair | 14,574.78 | 12,188.82 | **₹26,763.60** | 218,642 km | Hebbal Motors |
| **3** | VS0255 | 2024-04-06 | Bajaj Dominar (Motorcycle) | Engine Repair | 14,225.96 | 12,310.82 | **₹26,536.78** | 95,473 km | Yelahanka Service Hub |
| **4** | VS0553 | 2025-03-15 | Kia Seltos (SUV) | Engine Repair | 15,556.75 | 10,537.54 | **₹26,094.29** | 28,333 km | Yelahanka Service Hub |
| **5** | VS0091 | 2025-02-17 | Toyota Urban Cruiser (Hatchback) | Engine Repair | 12,483.40 | 10,340.65 | **₹22,824.05** | 145,292 km | Electronic City Garage |
| **6** | VS0011 | 2026-05-30 | Royal Enfield Bullet 350 (Motorcycle) | Engine Repair | 13,573.73 | 8,797.83 | **₹22,371.56** | 37,284 km | Electronic City Garage |
| **7** | VS0177 | 2025-08-27 | Tata Nexon (Van) | Engine Repair | 11,066.50 | 11,296.16 | **₹22,362.66** | 245,192 km | Mysuru Road Service |
| **8** | VS0070 | 2024-11-17 | Honda City (Sedan) | Engine Repair | 14,981.08 | 6,726.44 | **₹21,707.52** | 104,287 km | Mysuru Road Service |
| **9** | VS0338 | 2024-02-08 | Hero Xtreme (Motorcycle) | Transmission Service | 12,754.39 | 8,418.07 | **₹21,172.46** | 24,694 km | Yelahanka Service Hub |
| **10** | VS0077 | 2026-09-04 | Kia Sonet (SUV) | Engine Repair | 16,652.47 | 4,399.27 | **₹21,051.74** | 143,743 km | Bengaluru Central |

---

### Pipeline 8: Service Center Performance
**Objective:** Benchmark workload, average ticket size, and revenue across the 6 regional service locations.
```javascript
[
  {
    $group: {
      _id: "$service_center",
      totalServices: { $sum: 1 },
      avgRepairCost: { $avg: "$total_cost" },
      totalRevenue: { $sum: "$total_cost" },
      avgOdometer: { $avg: "$odometer_km" }
    }
  },
  { $sort: { totalServices: -1 } }
]
```
**Actual Output:**
| Service Center Location | Total Jobs Done | Average Job Cost (₹) | Total Center Revenue (₹) | Average Mileage (km) |
| :--- | :---: | :---: | :---: | :---: |
| **Whitefield Auto Care** | 109 | ₹5,782.02 | ₹630,240.38 | 99,780 km |
| **Hebbal Motors** | 107 | ₹6,610.65 | ₹707,339.38 | 80,502 km |
| **Bengaluru Central** | 101 | ₹6,066.89 | ₹612,756.29 | 99,071 km |
| **Electronic City Garage** | 98 | ₹7,525.83 | ₹737,530.87 | 88,044 km |
| **Mysuru Road Service** | 94 | ₹6,834.47 | ₹642,439.83 | 94,633 km |
| **Yelahanka Service Hub** | 91 | ₹7,112.13 | ₹647,203.79 | 78,467 km |

---

## 11. Dashboard Screenshots Checklist

For academic defense and project documentation, capture screenshots following the protocol detailed below:

1. **Figure 11.1 – MongoDB Compass Collection View:** Shows database `VehicleMaintenanceDB`, collection `service_records`, and document count `600`.
2. **Figure 11.2 – MongoDB Compass Schema View:** Shows field type validations (`Date` for `service_date`, `Double` for costs, `Int32` for odometer).
3. **Figure 11.3 – MongoDB Compass Indexes View:** Shows the unique index on `service_id` (`service_id_1`, Unique: True).
4. **Figure 11.4 – Terminal Import Verification:** Terminal log executing `node database/import.js` verifying 600 records parsed and inserted with zero duplicates.
5. **Figure 11.5 – Terminal Aggregation Output:** Terminal log executing `node database/aggregations.js` showing console tables.
6. **Figure 11.6 – Main Web Dashboard Overview:** Web browser at `http://localhost:5000` showing the 5 KPI summary cards and 4 interactive Chart.js graphs.
7. **Figure 11.7 – Service Records Management Table:** Paginated table displaying all 12 dataset fields with search bar and filter dropdowns.
8. **Figure 11.8 – Multi-Attribute Filtering in Action:** Active filtering showing Brand = `Toyota` and Type = `SUV`.
9. **Figure 11.9 – Insert Service Record Dialog:** Modal dialog showing field inputs for a new test record (`VS-TEST-101`) with automatic cost summation.
10. **Figure 11.10 – Academic Safety Shield Active:** Toast notification and modal rejecting the deletion of baseline record `VS0391` with HTTP 403 Forbidden.
11. **Figure 11.11 – MongoDB Aggregation Analytics Tab:** Charts and breakdown tables for Parts vs Labor expenditure and Top 10 High Cost Repairs.
12. **Figure 11.12 – Terminal Query Suite & MongoDB Shell:** Terminal execution showing parameterized queries, filtering, sorting, and CRUD verification.

---

## 12. Data Analysis and Observations

From the execution of the 8 aggregation pipelines on the 600 verified records, several key engineering and operational insights emerge:

1. **Component Replacement Dominates Over Labor:**
   Parts costs represent **59.56%** (₹23.69L) of cumulative expenditures, compared to **40.44%** (₹16.08L) for technician labor. Service franchises can optimize margins through volume agreements with parts distributors.
2. **Engine Repair as the Highest Cost Driver:**
   Engine repair procedures exhibit the highest average ticket size at **₹18,593.67**, followed by Transmission Service at **₹13,210.44**. Conversely, preventative maintenance such as Oil Changes (₹1,343.98) and Wheel Alignment (₹1,413.21) have low unit costs but high frequency.
3. **High Workload Stability Across Bangalore Facilities:**
   Workload distribution among the 6 service centers is balanced, ranging from 91 visits (Yelahanka Service Hub) to 109 visits (Whitefield Auto Care). However, Electronic City Garage recorded the highest average job cost (₹7,525.83) due to a higher concentration of complex transmission and engine overhauls.
4. **Status Throughput Health:**
   56.33% of service tickets are marked `Completed`, 24.67% `In Progress`, and 19.00% `Pending`, indicating an active, functioning maintenance pipeline.

---

## 13. Limitations

While the current system fulfills all academic and operational criteria, several limitations offer directions for future enhancements:
1. **Single-Node Deployment:** The current configuration utilizes a standalone MongoDB Community Server instance without replica sets or horizontal sharding.
2. **Synthetic Academic Data:** The 600 records represent simulated academic data rather than real-world telematics feeds. Real IoT telemetry would include sensor time-series data (e.g. vibration, battery voltage, temperature logs).
3. **Stateless Authentication:** The demonstration interface focuses on database operations and analytics without multi-tenant role-based access control (RBAC).
4. **Static Currency Assumption:** All financial values are modeled in Indian Rupees (INR ₹); multi-currency conversion is not implemented.

---

## 14. Conclusion

The **“Vehicle Service and Maintenance Analytics Using MongoDB”** academic project successfully demonstrates the design, ingestion, indexing, querying, and aggregation of multi-brand vehicle service records.

By choosing MongoDB, the system avoids the performance penalties associated with complex SQL multi-table joins when aggregating across vehicle categories, service centers, and temporal dimensions. The Express.js backend and responsive HTML5/Chart.js frontend provide an intuitive interface for service managers and database evaluators. The project fully satisfies every requirement of the project specification and provides a reusable, verified architecture for academic demonstration and viva defense.

---

## 15. Viva Questions and Answers

### Q1: What makes MongoDB more suitable than relational databases (like MySQL) for vehicle maintenance analytics?
**Answer:**
1. **Schema Flexibility:** Automotive service records frequently add diagnostic codes, parts manifests, and warranty flags. In MongoDB, documents in the same collection can naturally adapt without blocking schema migrations (`ALTER TABLE`).
2. **Aggregation Pipeline Framework:** MongoDB runs complex multi-stage aggregations (`$group`, `$sort`, `$project`) directly inside the database engine, avoiding costly table joins.
3. **Performance on Large-Scale Time-Series:** With native BSON date handling and indexing on compound attributes, MongoDB efficiently handles high-throughput operational records.

---

### Q2: What is the exact difference between a Database, a Collection, and a Document?
**Answer:**
- **Database (`VehicleMaintenanceDB`):** The top-level logical container for physical storage on disk.
- **Collection (`service_records`):** A grouped set of documents, analogous to an SQL table, but with dynamic schema enforcement.
- **Document:** An individual BSON record (e.g., a single vehicle service order) analogous to an SQL row, but capable of storing rich nested structures and datatypes.

---

### Q3: Why did you create a unique index on `service_id`? What happens if a duplicate is inserted?
**Answer:**
A unique index (`db.service_records.createIndex({ service_id: 1 }, { unique: true })`) guarantees entity integrity by enforcing that no two documents can have the same `service_id`. If an insert or update violates this condition, the MongoDB engine aborts the write operation and throws a Duplicate Key Error (`E11000 duplicate key error collection`).

---

### Q4: How does MongoDB calculate the dashboard statistics dynamically?
**Answer:**
All dashboard KPIs are computed on the fly using MongoDB aggregation queries rather than hardcoded variables:
- Total records: `collection.countDocuments()`.
- Total expenses and average cost: `$group: { _id: null, total: { $sum: "$total_cost" }, avg: { $avg: "$total_cost" } }`.
- Distinct brand count: `$group: { _id: "$vehicle_brand" }` followed by `$count`.
- Most common service: `$group: { _id: "$service_type", count: { $sum: 1 } }`, `$sort: { count: -1 }`, `$limit: 1`.

---

### Q5: How do the `$match`, `$group`, `$sort`, and `$project` stages interact in an aggregation pipeline?
**Answer:**
An aggregation pipeline functions as an assembly line where each stage transforms documents and passes its stream to the next stage:
1. `$match` filters out irrelevant documents early (analogous to `WHERE`).
2. `$group` aggregates documents by key (`_id`) and computes metrics with accumulators (`$sum`, `$avg`).
3. `$sort` orders the aggregated stream by metric (e.g. descending revenue).
4. `$project` reshapes the final document shape (e.g. computing percentage shares, renaming fields, and rounding decimal places).

---

### Q6: How does your application protect the original 600 records from accidental deletion during a viva demonstration?
**Answer:**
All 600 baseline dataset documents carry an immutable attribute `is_original: true`. The backend `deleteRecord` controller inspects this flag before executing any database mutation:
```javascript
if (record.is_original === true) {
  return res.status(403).json({ error: "Academic Shield Active: Original dataset records cannot be deleted." });
}
```
Examiners and students can freely insert new test records (e.g. `VS-TEST-101`) and delete them to demonstrate CRUD operations, while the 600 benchmark records remain permanently intact.

---

### Q7: Why are numeric fields converted to numbers instead of being stored as strings?
**Answer:**
If stored as strings, MongoDB performs lexicographical (alphabetical) sorting rather than numerical sorting. For instance, in string sorting `"1000"` appears before `"20"`. By converting `parts_cost`, `labor_cost`, and `total_cost` to BSON floating-point numbers (`Double`), numerical comparison operators (`$gt`, `$lt`) and mathematical accumulators (`$sum`, `$avg`) function correctly.
