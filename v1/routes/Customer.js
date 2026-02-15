const Controller = require('../controller/customer');
const Auth = require("../../common/authenticate");
const upload = require("../../services/uploadServices");
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

// Customer Authentication Routes
router.post("/signup", upload.single('image'), Controller.CustomerController.signup);
router.post("/login", Controller.CustomerController.login);
router.post("/google-login", Controller.CustomerController.googleLogin);
router.post("/facebook-login", Controller.CustomerController.facebookLogin);
router.post("/logout", Auth.verify("Customer"), Controller.CustomerController.logout);
router.get("/getProfile", Auth.verify("Customer"), Controller.CustomerController.getProfile);
router.post("/updateProfile", Auth.verify("Customer"), upload.single('image'), Controller.CustomerController.updateProfile);

// Address Routes
router.post("/addAddress", Auth.verify("Customer"), Controller.AddressController.addAddress);
router.get("/getAddresses", Auth.verify("Customer"), Controller.AddressController.getAddresses);
router.get("/getAddress/:id", Auth.verify("Customer"), Controller.AddressController.getAddressById);
router.post("/updateAddress/:id", Auth.verify("Customer"), Controller.AddressController.updateAddress);
router.delete("/deleteAddress/:id", Auth.verify("Customer"), Controller.AddressController.deleteAddress);
router.post("/setDefaultAddress/:id", Auth.verify("Customer"), Controller.AddressController.setDefaultAddress);

// Cart Routes
router.get("/getCart", Auth.verify("Customer"), Controller.CartController.getCart);
router.post("/addToCart", Auth.verify("Customer"), Controller.CartController.addToCart);
router.post("/syncCart", Auth.verify("Customer"), Controller.CartController.syncCart);
router.post("/updateCartItem/:itemId", Auth.verify("Customer"), Controller.CartController.updateCartItem);
router.delete("/removeFromCart/:itemId", Auth.verify("Customer"), Controller.CartController.removeFromCart);
router.delete("/clearCart", Auth.verify("Customer"), Controller.CartController.clearCart);

// Wishlist Routes
router.get("/getWishlist", Auth.verify("Customer"), Controller.WishlistController.getWishlist);
router.post("/addToWishlist", Auth.verify("Customer"), Controller.WishlistController.addToWishlist);
router.delete("/removeFromWishlist/:productId", Auth.verify("Customer"), Controller.WishlistController.removeFromWishlist);
router.delete("/clearWishlist", Auth.verify("Customer"), Controller.WishlistController.clearWishlist);
router.post("/syncWishlist", Auth.verify("Customer"), Controller.WishlistController.syncWishlist);

// Order Routes
router.post("/checkout", Auth.verify("Customer"), Controller.OrderController.checkout);
router.get("/getOrders", Auth.verify("Customer"), Controller.OrderController.getOrders);
router.get("/getOrder/:id", Auth.verify("Customer"), Controller.OrderController.getOrderById);
router.post("/cancelOrder/:id", Auth.verify("Customer"), Controller.OrderController.cancelOrder);

// Stripe Payment Routes (existing)
router.post("/createPaymentIntent", Auth.verify("Customer"), Controller.StripeController.createPaymentIntent);
router.post("/confirmPayment", Auth.verify("Customer"), Controller.StripeController.confirmPayment);
router.get("/getPaymentStatus/:orderId", Auth.verify("Customer"), Controller.StripeController.getPaymentStatus);

// New Stripe Service Routes (for testing)
router.post("/stripe/createCustomer", Controller.StripeController.createStripeCustomer);
router.post("/stripe/createSetupIntent", Controller.StripeController.createStripeSetupIntent);
router.post("/stripe/confirmSetupIntent", Controller.StripeController.confirmStripeSetupIntent);
router.post("/stripe/createPaymentIntent", Controller.StripeController.createStripePaymentIntent);

// Filter Visibility Routes
router.get("/getFilteredVisibility", Controller.ProductController.getFilteredVisibility);
router.get("/getFilteredMainMenu", Controller.ProductController.getFilteredMainMenu);

module.exports = router;

