const express = require("express");
const router = express.Router();

const productRoutes = require("./product.route");
const cartRoutes = require("./cart.route");

router.use("/products", productRoutes);
router.use("/cart", cartRoutes);

module.exports = router;