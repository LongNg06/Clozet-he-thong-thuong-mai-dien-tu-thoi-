// const express = require("express");
// const cors = require("cors");

// const app = express();

// require("./routes/database"); // kết nối database

// // ✅ require trước
// const routes = require("./routes/index");
// const categoryRoutes = require("./routes/categoryroutes");
// const productRoutes = require("./routes/product.route");
// // middleware
// app.use(cors());
// app.use(express.json());

// // static ảnh
// app.use("/danhmuc_img", express.static(__dirname + "/danhmuc_img"));
// app.use("/img", express.static(__dirname + "/img"));

// // routes
// app.use("/", routes);
// app.use("/categories", categoryRoutes);
// app.use("/products", productRoutes);
// // chạy server
// app.listen(5000);
const express = require("express");
const cors = require("cors");

const app = express();

require("./routes/database");

const routes = require("./routes/index");
const categoryRoutes = require("./routes/categoryroutes");
const productRoutes = require("./routes/product.route");

app.use(cors());
app.use(express.json());

// static
app.use("/danhmuc_img", express.static(__dirname + "/danhmuc_img"));
app.use("/img", express.static(__dirname + "/img"));

// routes
app.use("/", routes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);

app.listen(5000);