import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./routes";
dotenv.config();

export const app: Express = express();
export const env = process.env;

app.use(routes);

app.get("/", (req, res) => {
  res.send("Welcome dear");
});
