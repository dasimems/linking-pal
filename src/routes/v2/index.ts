import express from "express";
const v2route = express.Router();

v2route.get("/", (_, res) => {
  res.send("Version 2 under construction. Please visit back later");
});

export default v2route;
