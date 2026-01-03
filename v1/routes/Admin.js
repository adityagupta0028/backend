const Controller = require('../controller/admin')
const Auth = require("../../common/authenticate");
const upload = require("../../services/uploadServices");
const router = require('express').Router();


router.post("/signup",upload.single('image'), Controller.AdminController.signup)
router.post("/login", Controller.AdminController.login)
router.post("/logout",Auth.verify("Admin"), Controller.AdminController.logout)
router.post("/createCms",Auth.verify("Admin"),Controller.AdminController.createCms)
router.get("/getCms",Auth.verify("Admin"), Controller.AdminController.getCms)

router.post("/sendNotification", Controller.AdminController.sendNotification)

//user management
router.post("/addUser",upload.single('image'), Controller.UserManagementController.addUser)
router.get("/getUsers", Controller.UserManagementController.getUsers)
router.get("/getUserDetail/:id", Controller.UserManagementController.getUserDetail)
router.post("/updateUser/:id",upload.single('image'), Controller.UserManagementController.updateUser)
router.delete("/deleteUser/:id", Controller.UserManagementController.deleteUser)//team management



router.post("/addMember",upload.single('image'), Controller.TeamManagementController.addMember)
router.get("/getMembers",Controller.TeamManagementController.getAllTeamMember)
router.get("/getMemberDetail/:id", Controller.TeamManagementController.getTeamMemberDetail)
router.post("/updateMember/:id",upload.single('image'), Controller.TeamManagementController.updateTeamMember)
router.delete("/deleteMember/:id", Controller.TeamManagementController.deleteTeamMember)


//send notification from admin
router.post("/sendNotificationFromAdmin", Controller.AdminController.sendNotificationFromAdmin)


// Category Routes
router.post("/createCategory", Auth.verify("Admin"), upload.single('image'), Controller.CategoryController.createCategory);
router.get("/getCategories", Controller.CategoryController.getCategories);
router.get("/getCategoryDetail/:id", Controller.CategoryController.getCategoryDetail);
router.post("/updateCategory/:id", Auth.verify("Admin"), upload.single('image'), Controller.CategoryController.updateCategory);
router.delete("/deleteCategory/:id", Auth.verify("Admin"), Controller.CategoryController.deleteCategory);

// SubCategory Routes
router.post("/createSubCategory", Auth.verify("Admin"), upload.single('image'), Controller.CategoryController.createSubCategory);
router.get("/getSubCategories",Auth.verify("Admin"), Controller.CategoryController.getSubCategories);
router.get("/getSubCategoryDetail/:id",Auth.verify("Admin"), Controller.CategoryController.getSubCategoryDetail);
router.post("/updateSubCategory/:id", Auth.verify("Admin"), upload.single('image'), Controller.CategoryController.updateSubCategory);
router.delete("/deleteSubCategory/:id", Auth.verify("Admin"), Controller.CategoryController.deleteSubCategory);

// Product Routes
router.post("/createProduct", Auth.verify("Admin"), upload.array('images', 10), Controller.ProductController.createProduct);
router.get("/getProducts", Controller.ProductController.getProducts);
router.get("/getProductDetail/:id", Controller.ProductController.getProductDetail);
router.get("/getProductByProductId/:product_id", Controller.ProductController.getProductByProductId);
router.post("/updateProduct/:id", Auth.verify("Admin"), upload.array('images', 10), Controller.ProductController.updateProduct);
router.delete("/deleteProduct/:id", Auth.verify("Admin"), Controller.ProductController.deleteProduct);

//banner
router.post("/addBanner",Auth.verify("Admin"),upload.any(),Controller.BannerController.addBanner)
router.get("/getAllBanner", Auth.verify("admin"), Controller.BannerController.getAllBanner);
router.get("/getBannerById/:id", Auth.verify("admin"), Controller.BannerController.getBannerById);
router.put("/updateBanner/:id", Auth.verify("admin"),upload.any(), Controller.BannerController.updateBanner);
router.delete("/deleteBanner/:id", Auth.verify("admin"), Controller.BannerController.deleteBanner);

// BandFits Routes
router.post("/createBandFit", Auth.verify("Admin"), Controller.ProductAttributesController.createBandFit);
router.get("/getBandFits", Controller.ProductAttributesController.getBandFits);

// BandProfileShapes Routes
router.post("/createBandProfileShape", Auth.verify("Admin"), Controller.ProductAttributesController.createBandProfileShape);
router.get("/getBandProfileShapes", Controller.ProductAttributesController.getBandProfileShapes);

// BandWidthCategories Routes
router.post("/createBandWidthCategory", Auth.verify("Admin"), Controller.ProductAttributesController.createBandWidthCategory);
router.get("/getBandWidthCategories", Controller.ProductAttributesController.getBandWidthCategories);

// HoldingMethods Routes
router.post("/createHoldingMethod", Auth.verify("Admin"), Controller.ProductAttributesController.createHoldingMethod);
router.get("/getHoldingMethods", Controller.ProductAttributesController.getHoldingMethods);

// SettingConfigurations Routes
router.post("/createSettingConfiguration", Auth.verify("Admin"), Controller.ProductAttributesController.createSettingConfiguration);
router.get("/getSettingConfigurations", Controller.ProductAttributesController.getSettingConfigurations);

// ShankConfigurations Routes
router.post("/createShankConfiguration", Auth.verify("Admin"), Controller.ProductAttributesController.createShankConfiguration);
router.get("/getShankConfigurations", Controller.ProductAttributesController.getShankConfigurations);

// ShankTreatments Routes
router.post("/createShankTreatment", Auth.verify("Admin"), Controller.ProductAttributesController.createShankTreatment);
router.get("/getShankTreatments", Controller.ProductAttributesController.getShankTreatments);

// Styles Routes
router.post("/createStyle", Auth.verify("Admin"), Controller.ProductAttributesController.createStyle);
router.get("/getStyles", Controller.ProductAttributesController.getStyles);

// SettingFeatures Routes
router.post("/createSettingFeature", Auth.verify("Admin"), Controller.ProductAttributesController.createSettingFeature);
router.get("/getSettingFeatures", Controller.ProductAttributesController.getSettingFeatures);

// MotifThemes Routes
router.post("/createMotifTheme", Auth.verify("Admin"), Controller.ProductAttributesController.createMotifTheme);
router.get("/getMotifThemes", Controller.ProductAttributesController.getMotifThemes);

// OrnamentDetails Routes
router.post("/createOrnamentDetail", Auth.verify("Admin"), Controller.ProductAttributesController.createOrnamentDetail);
router.get("/getOrnamentDetails", Controller.ProductAttributesController.getOrnamentDetails);

// AccentStoneShapes Routes
router.post("/createAccentStoneShape", Auth.verify("Admin"), Controller.ProductAttributesController.createAccentStoneShape);
router.get("/getAccentStoneShapes", Controller.ProductAttributesController.getAccentStoneShapes);



module.exports = router