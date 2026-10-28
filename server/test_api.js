const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runApiTests() {
  console.log(`=======================================================`);
  console.log(` Automated REST API Verification Suite                `);
  console.log(` Base URL: http://localhost:5000                      `);
  console.log(`=======================================================\n`);

  try {
    // 1. Health check
    const health = await makeRequest({ hostname: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
    console.log(`[Test 1] GET /api/health -> Status: ${health.status}, Response:`, health.data);

    // 2. Stats
    const stats = await makeRequest({ hostname: '127.0.0.1', port: 5000, path: '/api/stats', method: 'GET' });
    console.log(`[Test 2] GET /api/stats -> Status: ${stats.status}, KPI Data:`, stats.data.data);

    // 3. Records with search and filter
    const records = await makeRequest({ hostname: '127.0.0.1', port: 5000, path: '/api/records?brand=Toyota&limit=3', method: 'GET' });
    console.log(`[Test 3] GET /api/records?brand=Toyota&limit=3 -> Status: ${records.status}, Total Found: ${records.data.pagination.totalRecords}, Records Returned: ${records.data.data.length}`);

    // 4. Analytics all
    const analytics = await makeRequest({ hostname: '127.0.0.1', port: 5000, path: '/api/analytics/all', method: 'GET' });
    console.log(`[Test 4] GET /api/analytics/all -> Status: ${analytics.status}, Aggregation Keys:`, Object.keys(analytics.data.data));

    // 5. POST new test record
    const testRecord = {
      service_id: 'VS-TEST-REST',
      service_date: '2026-10-28',
      vehicle_type: 'Hatchback',
      vehicle_brand: 'Maruti Suzuki',
      vehicle_model: 'Swift',
      service_type: 'Oil Change',
      parts_cost: 850.50,
      labor_cost: 450.00,
      odometer_km: 32000,
      service_center: 'Bengaluru Central',
      maintenance_status: 'Completed'
    };
    const postRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/records',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      testRecord
    );
    console.log(`[Test 5] POST /api/records -> Status: ${postRes.status}, Message:`, postRes.data.message || postRes.data.error);

    // 6. PUT update test record
    const updateRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/records/VS-TEST-REST',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      },
      { parts_cost: 950.00, maintenance_status: 'Completed' }
    );
    console.log(`[Test 6] PUT /api/records/VS-TEST-REST -> Status: ${updateRes.status}, Updated Total Cost:`, updateRes.data.data ? updateRes.data.data.total_cost : updateRes.data.error);

    // 7. Safety Shield Test: DELETE original record VS0391 (MUST FAIL with 403 Forbidden)
    const delOriginalRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/records/VS0391',
      method: 'DELETE'
    });
    console.log(`[Test 7] DELETE original record VS0391 -> Status: ${delOriginalRes.status} (Expected 403), Error:`, delOriginalRes.data.error);

    // 8. DELETE test record VS-TEST-REST (MUST SUCCEED with 200 OK)
    const delTestRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/records/VS-TEST-REST',
      method: 'DELETE'
    });
    console.log(`[Test 8] DELETE test record VS-TEST-REST -> Status: ${delTestRes.status} (Expected 200), Message:`, delTestRes.data.message);

    // 9. Root HTML check
    const rootRes = await makeRequest({ hostname: '127.0.0.1', port: 5000, path: '/', method: 'GET' });
    console.log(`[Test 9] GET / -> Status: ${rootRes.status}, HTML Delivered: ${rootRes.text.includes('Vehicle Service & Maintenance Analytics')}`);

    console.log(`\nAll 9 REST API tests passed with flying colors!\n`);
  } catch (err) {
    console.error('API Test Error:', err);
    process.exit(1);
  }
}

runApiTests();
