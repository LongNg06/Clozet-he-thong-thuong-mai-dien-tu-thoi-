const express = require("express");
const router = express.Router();

const productRoutes = require("./product.route");

router.use("/products", productRoutes);

module.exports = router;