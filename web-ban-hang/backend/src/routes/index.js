const express = require("express");
const router = express.Router();

router.use("/products", require("./product.route"));
router.use("/cart", require("./cart.route"));
router.use("/categories", require("./categoryroutes"));
router.use("/orders", require("./order.route"));
router.use("/revenue", require("./revenue.route"));
router.use("/admin", require("./admin.route"));
router.use("/vnpay", require("./vnpay"));

module.exports = router;