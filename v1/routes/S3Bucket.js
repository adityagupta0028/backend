const Controller = require('../controller/admin')
const router = require("express").Router();

router.get("/:filename",  Controller.ProductAttributesController.uploadFileS3Get);

module.exports = router;