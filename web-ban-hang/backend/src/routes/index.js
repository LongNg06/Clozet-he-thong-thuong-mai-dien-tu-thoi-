
const express = require("express");
const router = express.Router();
router.use("/notifications", require("./notifications.route"));
router.use("/user", require("./user.route"));


router.use("/products", require("./product.route"));
router.use("/cart", require("./cart.route"));
router.use("/categories", require("./categoryroutes"));
router.use("/orders", require("./order.route"));
router.use("/revenue", require("./revenue.route"));
router.use("/admin", require("./admin.route"));
router.use("/vnpay", require("./vnpay"));
router.use("/blogs", require("./blog.route"));
router.use("/login", require("./login.route"));

router.use("/checkout", require("./checkout.route"));
router.use("/wishlist", require("./wishlist.route"));
router.use("/reviews", require("./reviews.route"));

module.exports = router;