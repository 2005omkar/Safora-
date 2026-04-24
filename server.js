const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/safora");

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});


const express = require("express");
const app = express();

app.use(express.json());

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});


// const PORT = 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });