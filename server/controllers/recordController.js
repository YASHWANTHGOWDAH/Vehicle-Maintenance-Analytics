const { getCollection } = require('../config/db');

// GET /api/records - Retrieve filtered, sorted & paginated service records
exports.getRecords = async (req, res) => {
  try {
    const collection = getCollection();
    const {
      search,
      brand,
      vehicle_type,
      service_type,
      status,
      service_center,
      min_cost,
      max_cost,
      start_date,
      end_date,
      sort_by = 'service_date',
      sort_order = 'desc',
      page = 1,
      limit = 15
    } = req.query;

    const query = {};

    // Search query across service_id, vehicle_brand, vehicle_model
    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { service_id: { $regex: s, $options: 'i' } },
        { vehicle_brand: { $regex: s, $options: 'i' } },
        { vehicle_model: { $regex: s, $options: 'i' } },
        { service_type: { $regex: s, $options: 'i' } }
      ];
    }

    // Exact filter matches
    if (brand && brand !== 'All') {
      query.vehicle_brand = brand;
    }
    if (vehicle_type && vehicle_type !== 'All') {
      query.vehicle_type = vehicle_type;
    }
    if (service_type && service_type !== 'All') {
      query.service_type = service_type;
    }
    if (status && status !== 'All') {
      query.maintenance_status = status;
    }
    if (service_center && service_center !== 'All') {
      query.service_center = service_center;
    }

    // Cost range filters
    if (min_cost !== undefined && min_cost !== '' || max_cost !== undefined && max_cost !== '') {
      query.total_cost = {};
      if (min_cost !== undefined && min_cost !== '') {
        query.total_cost.$gte = parseFloat(min_cost);
      }
      if (max_cost !== undefined && max_cost !== '') {
        query.total_cost.$lte = parseFloat(max_cost);
      }
    }

    // Date range filters
    if (start_date || end_date) {
      query.service_date = {};
      if (start_date) {
        query.service_date.$gte = new Date(start_date + 'T00:00:00.000Z');
      }
      if (end_date) {
        query.service_date.$lte = new Date(end_date + 'T23:59:59.999Z');
      }
    }

    // Sorting
    const sortField = ['total_cost', 'service_date', 'odometer_km', 'service_id'].includes(sort_by)
      ? sort_by
      : 'service_date';
    const sortDirection = sort_order === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortDirection };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const totalRecords = await collection.countDocuments(query);
    const records = await collection
      .find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    res.json({
      success: true,
      data: records,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/records/:id - Get single record by service_id
exports.getRecordById = async (req, res) => {
  try {
    const collection = getCollection();
    const service_id = req.params.id;
    const record = await collection.findOne({ service_id });

    if (!record) {
      return res.status(404).json({ success: false, error: `Record with ID "${service_id}" not found.` });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    console.error('Error fetching single record:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/records - Create a new service record with validation
exports.createRecord = async (req, res) => {
  try {
    const collection = getCollection();
    const {
      service_id,
      service_date,
      vehicle_type,
      vehicle_brand,
      vehicle_model,
      service_type,
      parts_cost,
      labor_cost,
      odometer_km,
      service_center,
      maintenance_status
    } = req.body;

    // Validation
    if (!service_id || !service_date || !vehicle_type || !vehicle_brand || !vehicle_model || !service_type || !service_center || !maintenance_status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields. Please fill in all vehicle and service details.'
      });
    }

    const trimmedId = String(service_id).trim().toUpperCase();

    // Check uniqueness
    const existing = await collection.findOne({ service_id: trimmedId });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Service ID "${trimmedId}" already exists! Service IDs must be unique.`
      });
    }

    const pCost = parseFloat(parts_cost) || 0;
    const lCost = parseFloat(labor_cost) || 0;
    const totalCost = parseFloat((pCost + lCost).toFixed(2));
    const odo = parseInt(odometer_km, 10) || 0;

    const newRecord = {
      service_id: trimmedId,
      service_date: new Date(service_date + 'T00:00:00.000Z'),
      service_date_str: service_date,
      vehicle_type: String(vehicle_type).trim(),
      vehicle_brand: String(vehicle_brand).trim(),
      vehicle_model: String(vehicle_model).trim(),
      service_type: String(service_type).trim(),
      parts_cost: pCost,
      labor_cost: lCost,
      total_cost: totalCost,
      odometer_km: odo,
      service_center: String(service_center).trim(),
      maintenance_status: String(maintenance_status).trim(),
      is_original: false // Created via UI / API
    };

    const result = await collection.insertOne(newRecord);
    res.status(201).json({
      success: true,
      message: `Record ${trimmedId} created successfully!`,
      data: { ...newRecord, _id: result.insertedId }
    });
  } catch (err) {
    console.error('Error creating record:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/records/:id - Update an existing service record
exports.updateRecord = async (req, res) => {
  try {
    const collection = getCollection();
    const service_id = req.params.id;

    const record = await collection.findOne({ service_id });
    if (!record) {
      return res.status(404).json({ success: false, error: `Record "${service_id}" not found.` });
    }

    const {
      service_date,
      vehicle_type,
      vehicle_brand,
      vehicle_model,
      service_type,
      parts_cost,
      labor_cost,
      odometer_km,
      service_center,
      maintenance_status
    } = req.body;

    const updateFields = {};

    if (service_date) {
      updateFields.service_date = new Date(service_date + 'T00:00:00.000Z');
      updateFields.service_date_str = service_date;
    }
    if (vehicle_type) updateFields.vehicle_type = String(vehicle_type).trim();
    if (vehicle_brand) updateFields.vehicle_brand = String(vehicle_brand).trim();
    if (vehicle_model) updateFields.vehicle_model = String(vehicle_model).trim();
    if (service_type) updateFields.service_type = String(service_type).trim();
    if (service_center) updateFields.service_center = String(service_center).trim();
    if (maintenance_status) updateFields.maintenance_status = String(maintenance_status).trim();
    if (odometer_km !== undefined) updateFields.odometer_km = parseInt(odometer_km, 10);

    const pCost = parts_cost !== undefined ? parseFloat(parts_cost) : record.parts_cost;
    const lCost = labor_cost !== undefined ? parseFloat(labor_cost) : record.labor_cost;
    updateFields.parts_cost = pCost;
    updateFields.labor_cost = lCost;
    updateFields.total_cost = parseFloat((pCost + lCost).toFixed(2));
    updateFields.updated_at = new Date();

    await collection.updateOne({ service_id }, { $set: updateFields });

    const updated = await collection.findOne({ service_id });
    res.json({
      success: true,
      message: `Record ${service_id} updated successfully!`,
      data: updated
    });
  } catch (err) {
    console.error('Error updating record:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/records/:id - Safely delete a record (with academic dataset protection)
exports.deleteRecord = async (req, res) => {
  try {
    const collection = getCollection();
    const service_id = req.params.id;

    const record = await collection.findOne({ service_id });
    if (!record) {
      return res.status(404).json({ success: false, error: `Record "${service_id}" not found.` });
    }

    // Safety guard: Protect the original 600 academic dataset records!
    if (record.is_original === true) {
      return res.status(403).json({
        success: false,
        error: `Academic Shield Active: Record "${service_id}" belongs to the original 600 benchmark dataset and cannot be deleted. To demonstrate deletion, insert a new test record (e.g. "VS-TEST-101") and delete it.`
      });
    }

    await collection.deleteOne({ service_id });
    res.json({
      success: true,
      message: `Test record "${service_id}" deleted successfully.`
    });
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/options - Retrieve distinct values for dropdown filter population
exports.getFilterOptions = async (req, res) => {
  try {
    const collection = getCollection();
    const [brands, vehicleTypes, serviceTypes, serviceCenters, statuses] = await Promise.all([
      collection.distinct('vehicle_brand'),
      collection.distinct('vehicle_type'),
      collection.distinct('service_type'),
      collection.distinct('service_center'),
      collection.distinct('maintenance_status')
    ]);

    res.json({
      success: true,
      data: {
        brands: brands.sort(),
        vehicleTypes: vehicleTypes.sort(),
        serviceTypes: serviceTypes.sort(),
        serviceCenters: serviceCenters.sort(),
        statuses: statuses.sort()
      }
    });
  } catch (err) {
    console.error('Error getting filter options:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
