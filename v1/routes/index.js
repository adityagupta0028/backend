const router = require("express").Router();
const AdminRoutes = require("./Admin");
const CustomerRoutes = require("./Customer");


router.use("/Admin", AdminRoutes);
router.use("/Customer", CustomerRoutes);


module.exports = router;
