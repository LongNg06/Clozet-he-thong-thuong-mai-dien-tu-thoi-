
// const express = require("express");
// const cors = require("cors");

// const app = express();

// require("./routes/database");
// const vnpConfig = require("./routes/vnpay");

// const routes = require("./routes/index");
// const categoryRoutes = require("./routes/categoryroutes");
// const productRoutes = require("./routes/product.route");

// app.use(cors());
// app.use(express.json());


// // static
// app.use("/danhmuc_img", express.static(__dirname + "/danhmuc_img"));
// app.use("/img", express.static(__dirname + "/img"));

// // routes
// app.use("/", routes);
// app.use("/categories", categoryRoutes);
// app.use("/products", productRoutes);

// app.listen(5000);
const express = require("express");
const cors = require("cors");

const app = express();

require("./routes/database");

const routes = require("./routes/index");
const categoryRoutes = require("./routes/categoryroutes");
const productRoutes = require("./routes/product.route");
const vnpayRoutes = require("./routes/vnpay"); // 👈 thêm dòng này

app.use(cors());
app.use(express.json());

// static
app.use("/danhmuc_img", express.static(__dirname + "/danhmuc_img"));
app.use("/img", express.static(__dirname + "/img"));

// routes
app.use("/", routes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/api", vnpayRoutes); // 👈 thêm dòng này

app.listen(5000, () => {
    console.log("Server running port 5000");
});