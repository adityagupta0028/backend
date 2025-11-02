const Model = require("../../models/index");
const Validation = require("../validations");
const constants = require("../../common/constants");
const functions = require("../../common/functions");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Auth = require("../../common/authenticate");



module.exports.signup = async (req, res, next) => {
  try {
    await Validation.Admin.signup.validateAsync(req.body);
    let existingUser = await Model.Admin.findOne({
      email: req.body.email
    });
    if (existingUser) {
      throw new Error(constants.MESSAGES.EMAIL_ALREADY_IN_USE);
    }
    console.log("req.file", req.file)
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename
    }
    let admin = await Model.Admin.create(req.body);
    await admin.setPassword(req.body.password);
    await admin.save();

    // Remove password from response
    admin = JSON.parse(JSON.stringify(admin));
    delete admin.password;

    return res.success(constants.MESSAGES.ADMIN_CREATED, admin);
  } catch (error) {
    next(error);
  }
};
module.exports.login = async (req, res, next) => {
  try {
    await Validation.Admin.login.validateAsync(req.body);
    const lang = req.headers.language || "en";
    let doc = await Model.Admin.findOne({
      email: req.body.email
    });
    if (!doc) throw new Error(constants.MESSAGES.INVALID_CREDENTIALS);
    await doc.authenticate(req.body.password, doc._id);
    doc.accessToken = await Auth.getToken({
      _id: doc._id,
      email: doc.email
    });
    await doc.save();
    doc = JSON.parse(JSON.stringify(doc));
    doc.accessToken = await Auth.getToken({
      _id: doc._id,
      email: doc.email
    });
    delete doc.password;
    return res.success(constants.MESSAGES.LOGIN_SUCCESS, doc);
  } catch (error) {
    next(error);
  }
};
module.exports.logout = async (req, res, next) => {
  try {
    console.log("req.user", req.admin);

    return res.success(constants.MESSAGES.LOGOUT_SUCCESS);
  } catch (error) {
    next(error);
  }
}
module.exports.createCms = async (req, res, next) => {
  try {
    await Validation.Admin.cms.validateAsync(req.body);
    let existingCms = await Model.Cms.findOne({
      type: req.body.type,
      isDeleted: false
    });
    if (existingCms) {
      // Update existing CMS
      existingCms.title = req.body.title;
      existingCms.contents = req.body.contents;
      await existingCms.save();
      return res.success(constants.MESSAGES.UPDATED_SUCCESSFULLY, existingCms);
    }
    let cms = await Model.Cms.create(req.body);
    return res.success(constants.MESSAGES.DATA_UPLOADED, cms);
  } catch (error) {
    next(error);
  }
}
module.exports.getCms = async (req, res, next) => {
  try {
    await Validation.Admin.getCms.validateAsync(req.query);
    let cms = await Model.Cms.findOne({
      type: req.query.type,
      isDeleted: false,
      isActive: true
    });
    if (!cms) {
      throw new Error(constants.MESSAGES.CMS_NOT_FOUND);
    }
    return res.success(constants.MESSAGES.DATA_FETCHED, cms);
  } catch (error) {
    next(error);
  }
}
module.exports.sendNotification = async (req, res, next) => {
  try {
    // TODO: Implement notification sending logic
    return res.success(constants.MESSAGES.SUCCESS, { message: "Notification sent successfully" });
  } catch (error) {
    next(error);
  }
}
module.exports.sendNotificationFromAdmin = async (req, res, next) => {
  try {
    // TODO: Implement admin notification sending logic
    return res.success(constants.MESSAGES.SUCCESS, { message: "Notification sent successfully from admin" });
  } catch (error) {
    next(error);
  }
}





