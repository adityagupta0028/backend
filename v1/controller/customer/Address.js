const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");

module.exports.addAddress = async (req, res, next) => {
  try {
    await Validation.Customer.addAddress.validateAsync(req.body);
    req.body.customerId = req.customer._id;
    
    if (req.body.isDefault) {
      await Model.Address.updateMany(
        { customerId: req.customer._id, isDeleted: false },
        { $set: { isDefault: false } }
      );
    }
    
    let address = await Model.Address.create(req.body);
    return res.success(constants.MESSAGES.DATA_UPLOADED, address);
  } catch (error) {
    next(error);
  }
};

module.exports.getAddresses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const aggregationPipeline = [
      {
        $match: {
          customerId: req.customer._id,
          isDeleted: false
        }
      },
      {
        $sort: {
          isDefault: -1,
          createdAt: -1
        }
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit }
          ],
          total: [
            { $count: "count" }
          ]
        }
      },
      {
        $project: {
          addresses: "$data",
          total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] }
        }
      }
    ];
    
    const result = await Model.Address.aggregate(aggregationPipeline);
    const addresses = result[0]?.addresses || [];
    const total = result[0]?.total || 0;
    
    return res.success(constants.MESSAGES.DATA_FETCHED, {
      addresses,
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
};

module.exports.getAddressById = async (req, res, next) => {
  try {
    let address = await Model.Address.findOne({
      _id: req.params.id,
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!address) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    return res.success(constants.MESSAGES.DATA_FETCHED, address);
  } catch (error) {
    next(error);
  }
};

module.exports.updateAddress = async (req, res, next) => {
  try {
    await Validation.Customer.updateAddress.validateAsync(req.body);
    
    let address = await Model.Address.findOne({
      _id: req.params.id,
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!address) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    if (req.body.isDefault) {
      await Model.Address.updateMany(
        { customerId: req.customer._id, isDeleted: false, _id: { $ne: req.params.id } },
        { $set: { isDefault: false } }
      );
    }
    
    Object.assign(address, req.body);
    await address.save();
    
    return res.success(constants.MESSAGES.UPDATED_SUCCESSFULLY, address);
  } catch (error) {
    next(error);
  }
};

module.exports.deleteAddress = async (req, res, next) => {
  try {
    let address = await Model.Address.findOne({
      _id: req.params.id,
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!address) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    address.isDeleted = true;
    await address.save();
    
    return res.success(constants.MESSAGES.DELETE_SUCCESSFUL);
  } catch (error) {
    next(error);
  }
};

module.exports.setDefaultAddress = async (req, res, next) => {
  try {
    let address = await Model.Address.findOne({
      _id: req.params.id,
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!address) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    await Model.Address.updateMany(
      { customerId: req.customer._id, isDeleted: false },
      { $set: { isDefault: false } }
    );
    
    address.isDefault = true;
    await address.save();
    
    return res.success(constants.MESSAGES.UPDATED_SUCCESSFULLY, address);
  } catch (error) {
    next(error);
  }
};

