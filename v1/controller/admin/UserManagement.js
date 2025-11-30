const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");

module.exports.addUser = async (req, res, next) => {
  try {
    await Validation.Admin.addUser.validateAsync(req.body);
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }
    // TODO: Implement addUser logic with User model
    return res.success(constants.MESSAGES.DATA_UPLOADED, { message: "User added successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports.getUsers = async (req, res, next) => {
  try {
    // TODO: Implement getUsers logic
    return res.success(constants.MESSAGES.FETCH_USERS, []);
  } catch (error) {
    next(error);
  }
}

module.exports.getUserDetail = async (req, res, next) => {
  try {
    // TODO: Implement getUserDetail logic
    return res.success(constants.MESSAGES.FETCH_USER_DETAIL_ADMIN, {});
  } catch (error) {
    next(error);
  }
}

module.exports.updateUser = async (req, res, next) => {
  try {
    await Validation.Admin.updateUser.validateAsync(req.body);
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }
    // TODO: Implement updateUser logic
    return res.success(constants.MESSAGES.UPDATE_USER, { message: "User updated successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports.deleteUser = async (req, res, next) => {
  try {
    // TODO: Implement deleteUser logic
    return res.success(constants.MESSAGES.DELETE_USER, { message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}

