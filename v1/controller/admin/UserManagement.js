const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const { uploadFileToS3 } = require("../../../services/uploadS3Service");
const fs = require("fs");

module.exports.addUser = async (req, res, next) => {
  try {
    await Validation.Admin.addUser.validateAsync(req.body);
    
    // Check if user already exists
    const existingUser = await Model.Customer.findOne({
      email: req.body.email.toLowerCase(),
      isDeleted: false
    });

    if (existingUser) {
      throw new Error(constants.MESSAGES.EMAIL_ALREADY_IN_USE || "Email already in use");
    }

    // Handle image upload
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }

    // Create customer
    const customer = await Model.Customer.create({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      phone_number: req.body.phone_number || '',
      image: req.body.image || '',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    // Set password if provided
    if (req.body.password) {
      await customer.setPassword(req.body.password);
      await customer.save();
    }

    // Remove password from response
    const customerData = customer.toObject();
    delete customerData.password;

    return res.success(constants.MESSAGES.DATA_UPLOADED || "User added successfully", customerData);
  } catch (error) {
    next(error);
  }
}

module.exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {
      isDeleted: false
    };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (req.query.status) {
      if (req.query.status === 'active') {
        query.isActive = true;
      } else if (req.query.status === 'inactive') {
        query.isActive = false;
      } else if (req.query.status === 'suspended') {
        // You can add a suspended field to Customer model if needed
        query.isActive = false;
      }
    }

    const customers = await Model.Customer.find(query)
      .select('-password -accessToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Model.Customer.countDocuments(query);

    // Format response
    const formattedCustomers = customers.map(customer => {
      const customerData = customer.toObject();
      // Determine role (all customers are "Customer" role in this system)
      customerData.role = 'Customer';
      // Map isActive to status
      customerData.status = customerData.isActive ? 'Active' : 'Inactive';
      return customerData;
    });

    return res.success(constants.MESSAGES.FETCH_USERS || "Users fetched successfully", {
      users: formattedCustomers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports.getUserDetail = async (req, res, next) => {
  try {
    const customer = await Model.Customer.findOne({
      _id: req.params.id,
      isDeleted: false
    }).select('-password -accessToken');

    if (!customer) {
      throw new Error(constants.MESSAGES.NOT_FOUND || "User not found");
    }

    const customerData = customer.toObject();
    customerData.role = 'Customer';
    customerData.status = customerData.isActive ? 'Active' : 'Inactive';

    return res.success(constants.MESSAGES.FETCH_USER_DETAIL_ADMIN || "User detail fetched successfully", customerData);
  } catch (error) {
    next(error);
  }
}

module.exports.updateUser = async (req, res, next) => {
  try {
    await Validation.Admin.updateUser.validateAsync(req.body);
    
    const customer = await Model.Customer.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!customer) {
      throw new Error(constants.MESSAGES.NOT_FOUND || "User not found");
    }

    // Check if email is being changed and if it's already in use
    if (req.body.email && req.body.email.toLowerCase() !== customer.email.toLowerCase()) {
      const existingUser = await Model.Customer.findOne({
        email: req.body.email.toLowerCase(),
        isDeleted: false,
        _id: { $ne: req.params.id }
      });

      if (existingUser) {
        throw new Error(constants.MESSAGES.EMAIL_ALREADY_IN_USE || "Email already in use");
      }
    }

    // Handle image upload
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }

    // Update fields
    if (req.body.name) customer.name = req.body.name;
    if (req.body.email) customer.email = req.body.email.toLowerCase();
    if (req.body.phone_number !== undefined) customer.phone_number = req.body.phone_number;
    if (req.body.image) customer.image = req.body.image;
    if (req.body.isActive !== undefined) customer.isActive = req.body.isActive;

    // Update password if provided
    if (req.body.password) {
      await customer.setPassword(req.body.password);
    }

    await customer.save();

    // Remove password from response
    const customerData = customer.toObject();
    delete customerData.password;
    delete customerData.accessToken;
    customerData.role = 'Customer';
    customerData.status = customerData.isActive ? 'Active' : 'Inactive';

    return res.success(constants.MESSAGES.UPDATE_USER || "User updated successfully", customerData);
  } catch (error) {
    next(error);
  }
}

module.exports.deleteUser = async (req, res, next) => {
  try {
    const customer = await Model.Customer.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!customer) {
      throw new Error(constants.MESSAGES.NOT_FOUND || "User not found");
    }

    // Soft delete
    customer.isDeleted = true;
    await customer.save();

    return res.success(constants.MESSAGES.DELETE_USER || "User deleted successfully", { id: customer._id });
  } catch (error) {
    next(error);
  }
}
