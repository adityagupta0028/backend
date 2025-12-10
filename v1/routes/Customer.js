const Controller = require('../controller/customer');
const router = require('express').Router();

// Product Routes for Customers
router.get("/getProducts", Controller.ProductController.getProducts);
router.post("/getProducts", Controller.ProductController.getProducts);

module.exports = router;

