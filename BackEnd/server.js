import express from "express";
import connectDB from "./config/db.js";
import "dotenv/config";
import app from "./app.js";

const port = process.env.PORT || 4000;

// DB Connect
connectDB(process.env.MONGO_URI);

app.listen(port, () => {
  console.log(`Backend app listening on port ${port}`);
});
