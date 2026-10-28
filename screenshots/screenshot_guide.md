# Screenshot Capture Guide & Verification Checklist

This guide provides step-by-step instructions for capturing genuine screenshots from **MongoDB Compass**, the **MongoDB Shell (`mongosh`)**, **Terminal execution**, and the **Web Application Dashboard**.

---

## 📸 Required Screenshot Checklist

| Screenshot ID | Component / Screen | Description & What to Display | Status |
| :--- | :--- | :--- | :--- |
| **SS-01** | **MongoDB Compass: Database & Collection View** | Shows database `VehicleMaintenanceDB`, collection `service_records`, document count `600`, storage size, and index count `8`. | Required |
| **SS-02** | **MongoDB Compass: Document Schema View** | Shows the 12 fields and types (`service_id`, `service_date: Date`, `total_cost: Double`, `odometer_km: Int32`, etc.). | Required |
| **SS-03** | **MongoDB Compass: Indexes Tab** | Shows the unique index on `service_id` (`service_id_1`, Unique: True) along with supporting indexes. | Required |
| **SS-04** | **MongoDB Shell (`mongosh`) Execution** | Terminal window running `mongosh` commands: `use VehicleMaintenanceDB`, `db.service_records.countDocuments()`, `db.service_records.findOne()`. | Required |
| **SS-05** | **Terminal: Dataset Import Execution** | Shows running `node database/import.js` or `npm run db:import` confirming 600 records parsed and inserted. | Required |
| **SS-06** | **Terminal: Query & Aggregation Execution** | Shows running `node database/queries.js` and `node database/aggregations.js` with table outputs. | Required |
| **SS-07** | **Web UI: Main Dashboard Overview** | Browser at `http://localhost:5000` showing 5 KPI cards (Total Records: 600, Total Expenses: ₹39.78L, Avg Cost: ₹6,629, Brands: 13, Top Service: General Service) and 4 charts. | Required |
| **SS-08** | **Web UI: Service Records Table** | Shows the paginated data table with all 12 columns, search bar, and filter dropdowns. | Required |
| **SS-09** | **Web UI: Filtering in Action** | Shows filtered results (e.g., Brand = `Hyundai`, Vehicle Type = `SUV`) with active badge counters. | Required |
| **SS-10** | **Web UI: Insert Service Record Modal** | Shows the "Add Service Record" dialog with inputs filled for a test record (e.g. `VS-TEST-101`). | Required |
| **SS-11** | **Web UI: Academic Safety Shield in Action** | Shows the dialog/toast blocking deletion of an original record (VS0391) with the 403 Forbidden protection message. | Required |
| **SS-12** | **Web UI: Analytics & Aggregation Engine** | Shows the Analytics tab with Parts vs. Labor comparison cards, Cost by Vehicle Type chart, and Top 10 Expensive Repairs table. | Required |

---

## 🛠️ Step-by-Step Instructions to Capture Genuine Screenshots

### 1. MongoDB Compass Screenshots (SS-01, SS-02, SS-03)
1. Open **MongoDB Compass**.
2. Connect to URI: `mongodb://127.0.0.1:27017`.
3. In the left sidebar, click on database **`VehicleMaintenanceDB`**, then select **`service_records`**.
4. **For SS-01:** On the top bar, ensure `600 Documents` is clearly visible. Press `Win + Shift + S` to capture the window. Save as `screenshots/ss01_compass_collection.png`.
5. **For SS-02:** Click on the **Schema** tab, click **Analyze Schema**. Capture the type distribution showing Date and Numeric types. Save as `screenshots/ss02_compass_schema.png`.
6. **For SS-03:** Click on the **Indexes** tab. Verify `service_id_1` has the green checkmark for `Unique`. Capture the table. Save as `screenshots/ss03_compass_indexes.png`.

### 2. MongoDB Shell / mongosh Screenshot (SS-04)
1. Open Windows Terminal or Command Prompt.
2. Run:
   ```bash
   mongosh "mongodb://127.0.0.1:27017/VehicleMaintenanceDB"
   ```
3. Type the following commands:
   ```javascript
   show collections
   db.service_records.countDocuments()
   db.service_records.findOne({ service_id: "VS0391" })
   ```
4. Capture the terminal showing the prompt, queries, and JSON output. Save as `screenshots/ss04_mongosh_terminal.png`.

### 3. Application Execution Screenshots (SS-05, SS-06)
1. In your terminal, run:
   ```bash
   npm run db:import
   ```
   Capture the output showing `Parsed 600 records from CSV` and `Integrity Check Passed`. Save as `screenshots/ss05_terminal_import.png`.
2. Run:
   ```bash
   npm run db:aggregations
   ```
   Capture the formatted console tables for Vehicle Types and Service Center performance. Save as `screenshots/ss06_terminal_aggregations.png`.

### 4. Browser Application Screenshots (SS-07 through SS-12)
1. Start the server:
   ```bash
   npm start
   ```
2. Open your web browser and navigate to: `http://localhost:5000`.
3. **SS-07 (Dashboard):** Take a screenshot of the top KPI cards and the four Chart.js graphs. Save as `screenshots/ss07_dashboard_overview.png`.
4. **SS-08 (Records Table):** Click the **Service Records** tab. Ensure rows displaying `service_id`, `service_date`, `vehicle_type`, `parts_cost`, `labor_cost`, `total_cost`, `odometer_km`, and badges are visible. Save as `screenshots/ss08_records_table.png`.
5. **SS-09 (Filtering):** Select `Toyota` in Brand, and `SUV` in Type. Click "Apply Filters". Capture the filtered table showing matched count. Save as `screenshots/ss09_records_filtered.png`.
6. **SS-10 (Add Modal):** Click "Add Service Record". Fill in sample fields. Capture the modal dialog. Save as `screenshots/ss10_add_record_modal.png`.
7. **SS-11 (Academic Shield):** Find record `VS0391`, click "Del". Observe the warning dialog and deletion rejection toast. Capture this view. Save as `screenshots/ss11_academic_shield_protection.png`.
8. **SS-12 (Analytics):** Click the **Analytics & Pipelines** tab. Scroll to the Top 10 Most Expensive Repairs table and Parts vs Labor summary cards. Capture this section. Save as `screenshots/ss12_analytics_pipelines.png`.
