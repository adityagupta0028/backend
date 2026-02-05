const Controller = require('../controller/admin')
const Auth = require("../../common/authenticate");
const upload = require("../../services/uploadServices");
const router = require('express').Router();

router.post("/uploadFileS3", upload.single("file"), Controller.AdminController.uploadFileS3);
router.post("/signup",upload.single('image'), Controller.AdminController.signup)
router.post("/login", Controller.AdminController.login)
router.post("/logout",Auth.verify("Admin"), Controller.AdminController.logout)
router.post("/createCms",Auth.verify("Admin"),Controller.AdminController.createCms)
router.get("/getCms",Auth.verify("Admin"), Controller.AdminController.getCms)

router.post("/sendNotification", Controller.AdminController.sendNotification)

//user management
router.post("/addUser", Auth.verify("Admin"), upload.single('image'), Controller.UserManagementController.addUser)
router.get("/getUsers", Auth.verify("Admin"), Controller.UserManagementController.getUsers)
router.get("/getUserDetail/:id", Auth.verify("Admin"), Controller.UserManagementController.getUserDetail)
router.post("/updateUser/:id", Auth.verify("Admin"), upload.single('image'), Controller.UserManagementController.updateUser)
router.delete("/deleteUser/:id", Auth.verify("Admin"), Controller.UserManagementController.deleteUser)//team management



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

// SubSubCategory Routes
router.post("/createSubSubCategory", Auth.verify("Admin"), upload.single('image'), Controller.CategoryController.createSubSubCategory);
router.get("/getSubSubCategories", Auth.verify("Admin"), Controller.CategoryController.getSubSubCategories);
router.get("/getSubSubCategoryDetail/:id", Auth.verify("Admin"), Controller.CategoryController.getSubSubCategoryDetail);
router.post("/updateSubSubCategory/:id", Auth.verify("Admin"), upload.single('image'), Controller.CategoryController.updateSubSubCategory);
router.delete("/deleteSubSubCategory/:id", Auth.verify("Admin"), Controller.CategoryController.deleteSubSubCategory);

// Product Routes
router.post("/createProduct", Auth.verify("Admin"), upload.any(), Controller.ProductController.createProduct);
router.post("/createBraceletProduct", Auth.verify("Admin"), upload.any(), Controller.ProductController.createBraceletProduct);
router.post("/createNecklaceProduct", Auth.verify("Admin"), upload.any(), Controller.ProductController.createNecklaceProduct);
router.post("/createEarringsProduct", Auth.verify("Admin"), upload.any(), Controller.ProductController.createEarringsProduct);
router.post("/import-ring-product", Auth.verify("Admin"), upload.single("csv"), Controller.ProductController.importRingProducts);
router.get("/getProducts", Controller.ProductController.getProducts);
router.get("/getProductDetail/:id", Controller.ProductController.getProductDetail);
router.get("/getProductByProductId/:product_id", Controller.ProductController.getProductByProductId);
router.post("/updateProduct/:id", Auth.verify("Admin"), upload.any(), Controller.ProductController.updateProduct);
router.delete("/deleteProduct/:id", Auth.verify("Admin"), Controller.ProductController.deleteProduct);

//banner
router.post("/addBanner",Auth.verify("Admin"),upload.any(),Controller.BannerController.addBanner)
router.get("/getAllBanner", Auth.verify("admin"), Controller.BannerController.getAllBanner);
router.get("/getBannerById/:id", Auth.verify("admin"), Controller.BannerController.getBannerById);
router.put("/updateBanner/:id", Auth.verify("admin"),upload.any(), Controller.BannerController.updateBanner);
router.delete("/deleteBanner/:id", Auth.verify("admin"), Controller.BannerController.deleteBanner);

// BandFits Routes
router.post("/createBandFit", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createBandFit);
router.get("/getBandFits", Controller.ProductAttributesController.getBandFits);

// FlexibilityType Routes
router.post("/createFlexibilityType", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createFlexibilityType);
router.get("/getFlexibilityTypes", Controller.ProductAttributesController.getFlexibilityTypes);

// ProductSpecials Routes
router.post("/createProductSpecial", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createProductSpecial);
router.get("/getProductSpecials", Controller.ProductAttributesController.getProductSpecials);

// Collections Routes
router.post("/createCollection", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createCollection);
router.get("/getCollections", Controller.ProductAttributesController.getCollections);

// ChainLinkType Routes
router.post("/createChainLinkType", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createChainLinkType);
router.get("/getChainLinkTypes", Controller.ProductAttributesController.getChainLinkTypes);

// ClosureType Routes
router.post("/createClosureType", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createClosureType);
router.get("/getClosureTypes", Controller.ProductAttributesController.getClosureTypes);

// StoneSetting Routes
router.post("/createStoneSetting", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createStoneSetting);
router.get("/getStoneSettings", Controller.ProductAttributesController.getStoneSettings);

// PlacementFit Routes
router.post("/createPlacementFit", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createPlacementFit);
router.get("/getPlacementFits", Controller.ProductAttributesController.getPlacementFits);

// BandProfileShapes Routes
router.post("/createBandProfileShape", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createBandProfileShape);
router.get("/getBandProfileShapes", Controller.ProductAttributesController.getBandProfileShapes);

// BandWidthCategories Routes
router.post("/createBandWidthCategory", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createBandWidthCategory);
router.get("/getBandWidthCategories", Controller.ProductAttributesController.getBandWidthCategories);

// HoldingMethods Routes
router.post("/createHoldingMethod", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createHoldingMethod);
router.get("/getHoldingMethods", Controller.ProductAttributesController.getHoldingMethods);

// SettingConfigurations Routes
router.post("/createSettingConfiguration", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createSettingConfiguration);
router.get("/getSettingConfigurations", Controller.ProductAttributesController.getSettingConfigurations);

// ShankConfigurations Routes
router.post("/createShankConfiguration", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createShankConfiguration);
router.get("/getShankConfigurations", Controller.ProductAttributesController.getShankConfigurations);

// ShankTreatments Routes
router.post("/createShankTreatment", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createShankTreatment);
router.get("/getShankTreatments", Controller.ProductAttributesController.getShankTreatments);

// Styles Routes
router.post("/createStyle", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createStyle);
router.get("/getStyles", Controller.ProductAttributesController.getStyles);

// SettingFeatures Routes
router.post("/createSettingFeature", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createSettingFeature);
router.get("/getSettingFeatures", Controller.ProductAttributesController.getSettingFeatures);

// MotifThemes Routes
router.post("/createMotifTheme", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createMotifTheme);
router.get("/getMotifThemes", Controller.ProductAttributesController.getMotifThemes);

// OrnamentDetails Routes
router.post("/createOrnamentDetail", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createOrnamentDetail);
router.get("/getOrnamentDetails", Controller.ProductAttributesController.getOrnamentDetails);

// AccentStoneShapes Routes
router.post("/createAccentStoneShape", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createAccentStoneShape);
router.get("/getAccentStoneShapes", Controller.ProductAttributesController.getAccentStoneShapes);

// AssemblyType Routes
router.post("/createAssemblyType", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createAssemblyType);
router.get("/getAssemblyTypes", Controller.ProductAttributesController.getAssemblyTypes);

// ChainType Routes
router.post("/createChainType", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createChainType);
router.get("/getChainTypes", Controller.ProductAttributesController.getChainTypes);

// FinishDetail Routes
router.post("/createFinishDetail", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createFinishDetail);
router.get("/getFinishDetails", Controller.ProductAttributesController.getFinishDetails);

// UnitOfSale Routes
router.post("/createUnitOfSale", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createUnitOfSale);
router.get("/getUnitOfSales", Controller.ProductAttributesController.getUnitOfSales);

// DropShape Routes
router.post("/createDropShape", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createDropShape);
router.get("/getDropShapes", Controller.ProductAttributesController.getDropShapes);

// AttachmentType Routes
router.post("/createAttachmentType", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createAttachmentType);
router.get("/getAttachmentTypes", Controller.ProductAttributesController.getAttachmentTypes);

// EarringOrientation Routes
router.post("/createEarringOrientation", Auth.verify("Admin"), upload.single('image'), Controller.ProductAttributesController.createEarringOrientation);
router.get("/getEarringOrientations", Controller.ProductAttributesController.getEarringOrientations);

// Filter Visibility Routes
router.get("/getFilterVisibility", Auth.verify("Admin"), Controller.FilterController.getFilterVisibility);
router.post("/updateFilterVisibility", Auth.verify("Admin"), Controller.FilterController.updateFilterVisibility);
router.post("/updateFilterImage", Auth.verify("Admin"), upload.single('image'), Controller.FilterController.updateFilterImage);

// Menu Filter Settings Routes
router.post("/saveMenuFilterSettings", Auth.verify("Admin"), Controller.FilterController.saveMenuFilterSettings);
router.get("/getMenuFilterSettings", Auth.verify("Admin"), Controller.FilterController.getMenuFilterSettings);

// Hero Menu Routes
router.post("/createHeroMenu", Auth.verify("Admin"), Controller.HeroMenuController.createHeroMenu);
router.get("/getHeroMenus", Auth.verify("Admin"), Controller.HeroMenuController.getHeroMenus);
router.get("/getHeroMenuByCategory/:categoryId", Auth.verify("Admin"), Controller.HeroMenuController.getHeroMenuByCategory);
router.get("/getHeroMenuDetail/:id", Auth.verify("Admin"), Controller.HeroMenuController.getHeroMenuDetail);
router.post("/updateHeroMenu/:id", Auth.verify("Admin"), Controller.HeroMenuController.updateHeroMenu);
router.delete("/deleteHeroMenu/:id", Auth.verify("Admin"), Controller.HeroMenuController.deleteHeroMenu);

// Order Routes (Admin)
router.get("/getOrders", Auth.verify("Admin"), Controller.OrderController.getOrders);
router.get("/getOrder/:id", Auth.verify("Admin"), Controller.OrderController.getOrderById);
router.post("/updateOrderStatus/:id", Auth.verify("Admin"), Controller.OrderController.updateOrderStatus);
router.delete("/deleteOrder/:id", Auth.verify("Admin"), Controller.OrderController.deleteOrder);

module.exports = router