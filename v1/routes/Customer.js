const Controller = require('../controller/customer');
const router = require('express').Router();

// Product Routes for Customers
router.post("/getProducts", Controller.ProductController.getProducts);
router.get("/getProductDetails", Controller.ProductController.getProductDetails);
// Category Routes for Customers
router.get("/getCategories", Controller.CategoryController.getCategories);
// Subcategory Routes for Customers
router.get("/getSubcategories", Controller.CategoryController.getSubcategories);
// Category Detail Route for Customers
router.get("/getCategoryDetail", Controller.CategoryController.getCategoryDetail);

module.exports = router;

