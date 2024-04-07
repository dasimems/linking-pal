import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import bodyParser from "body-parser";
import mongoose from "mongoose";
dotenv.config();

export const app: Express = express();
export const env = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose
  .connect(env.CLOUD_CONNECTION_STRING as string)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(routes);

app.get("/", (req, res) => {
  res.send("Welcome dear");
});
