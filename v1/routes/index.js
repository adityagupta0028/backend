const router = require("express").Router();
const AdminRoutes = require("./Admin");


router.use("/Admin", AdminRoutes);



module.exports = router;
