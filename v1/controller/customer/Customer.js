const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const Auth = require("../../../common/authenticate");

module.exports.signup = async (req, res, next) => {
  try {
    await Validation.Customer.signup.validateAsync(req.body);
    let existingCustomer = await Model.Customer.findOne({
      email: req.body.email,
      isDeleted: false
    });
    if (existingCustomer) {
      throw new Error(constants.MESSAGES.EMAIL_ALREADY_IN_USE);
    }
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }
    let customer = await Model.Customer.create(req.body);
    await customer.setPassword(req.body.password);
    await customer.save();

    customer = JSON.parse(JSON.stringify(customer));
    delete customer.password;

    return res.success(constants.MESSAGES.ACCOUNT_CREATED_SUCCESSFULLY, customer);
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    await Validation.Customer.login.validateAsync(req.body);
    let customer = await Model.Customer.findOne({
      email: req.body.email,
      isDeleted: false
    });
    if (!customer) throw new Error(constants.MESSAGES.INVALID_CREDENTIALS);
    if (!customer.isActive) throw new Error(constants.MESSAGES.ACCOUNT_BLOCKED);
    
    await customer.authenticate(req.body.password);
    
    customer.lastLogin = new Date();
    customer.accessToken = await Auth.getToken({
      _id: customer._id,
      email: customer.email
    });
    await customer.save();
    
    customer = JSON.parse(JSON.stringify(customer));
    customer.accessToken = await Auth.getToken({
      _id: customer._id,
      email: customer.email
    });
    delete customer.password;
    
    return res.success(constants.MESSAGES.LOGIN_SUCCESS, customer);
  } catch (error) {
    next(error);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    if (req.customer) {
      await Model.Customer.findByIdAndUpdate(req.customer._id, {
        $unset: { accessToken: 1 }
      });
    }
    return res.success(constants.MESSAGES.LOGOUT_SUCCESS);
  } catch (error) {
    next(error);
  }
};

module.exports.getProfile = async (req, res, next) => {
  try {
    let customer = await Model.Customer.findById(req.customer._id).select('-password');
    if (!customer) {
      throw new Error(constants.MESSAGES.USER_NOT_FOUND);
    }
    return res.success(constants.MESSAGES.DATA_FETCHED, customer);
  } catch (error) {
    next(error);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }
    let customer = await Model.Customer.findByIdAndUpdate(
      req.customer._id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    
    if (!customer) {
      throw new Error(constants.MESSAGES.USER_NOT_FOUND);
    }
    
    return res.success(constants.MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, customer);
  } catch (error) {
    next(error);
  }
};

