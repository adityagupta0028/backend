const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const { uploadFileToS3 } = require("../../../services/uploadS3Service");
const fs = require("fs");
module.exports.addMember = async (req, res, next) => {
  try {
    await Validation.Admin.createTeamMember.validateAsync(req.body);
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }
    // TODO: Implement addMember logic with TeamMember model
    return res.success(constants.MESSAGES.TEAM_MEMBER_CREATED, { message: "Team member added successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports.getAllTeamMember = async (req, res, next) => {
  try {
    // TODO: Implement getAllTeamMember logic
    return res.success(constants.MESSAGES.FETCH_TEAM_MEMBER, []);
  } catch (error) {
    next(error);
  }
}

module.exports.getTeamMemberDetail = async (req, res, next) => {
  try {
    // TODO: Implement getTeamMemberDetail logic
    return res.success(constants.MESSAGES.FETCH_TEAM_MEMBER, {});
  } catch (error) {
    next(error);
  }
}

module.exports.updateTeamMember = async (req, res, next) => {
  try {
    await Validation.Admin.updateTeamMember.validateAsync(req.body);
    if (req.file) {
      req.body.image = "/uploads/" + req.file.filename;
    }
    // TODO: Implement updateTeamMember logic
    return res.success(constants.MESSAGES.UPDATE_TEAM_MEMBER, { message: "Team member updated successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports.deleteTeamMember = async (req, res, next) => {
  try {
    // TODO: Implement deleteTeamMember logic
    return res.success(constants.MESSAGES.DELETE_TEAM_MEMBER, { message: "Team member deleted successfully" });
  } catch (error) {
    next(error);
  }
}

