const express = require("express");
const cors = require("cors");

const app = express();

require("./routes/database"); // kết nối database

// ✅ require trước
const routes = require("./routes/index");
const categoryRoutes = require("./routes/categoryroutes");

// middleware
app.use(cors());
app.use(express.json());

// static ảnh
app.use("/danhmuc_img", express.static(__dirname + "/danhmuc_img"));
app.use("/img", express.static(__dirname + "/img"));

// routes
app.use("/", routes);
app.use("/categories", categoryRoutes);

// chạy server
app.listen(5000, () => {
  console.log("Server đang chạy ở port 5000");
});