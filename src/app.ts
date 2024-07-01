import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import path from "path";
import { createUserDetails, reverseToken } from "./utils/functions";
import { OTPTokenType, TokenType } from "./utils/types";
import UserSchema from "./models/UserSchema";
import { validateSocketUser } from "./middleware/socket";
import {
  getMessageController,
  markMessageReadController,
  sendChatList,
  sendMessageController
} from "./controllers/chat";
import { USER } from "./utils/enums";
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
app.use("/admin", express.static(path.join(__dirname, "..", "web")));
console.log(path.join(__dirname, "..", "web", "error-logs"));

export let allConnectedSocket: {
  [userId: string]: {
    [socketId: string]: Socket;
  };
} = {};
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  /* options */
});
io.use(validateSocketUser);
io.engine.on("connection_error", (err) => {
  console.log("Request error"); // the request object
  console.log(err.req); // the request object
  console.log("Code error"); // the error code, for example 1
  console.log(err.code); // the error code, for example 1
  console.log("Message error"); // the error message, for example "Session ID unknown"
  console.log("Context error"); // some additional error context
  console.log(err.context); // some additional error context
});
io.on("connection", (socket: Socket & { user?: any }) => {
  const user = socket?.user;

  if (user) {
    const pastUserConnections = allConnectedSocket[JSON.stringify(user?.id)];
    allConnectedSocket[JSON.stringify(user?.id)] = {
      ...pastUserConnections,
      [socket.id]: socket
    };
    const userDetails = createUserDetails(user);
    socket.emit(USER, userDetails);
    sendMessageController(socket);
    getMessageController(socket);
    markMessageReadController(socket);
    sendChatList(socket?.user?._id);
    socket.on("disconnect", () => {
      let newConnection: { [socketId: string]: Socket } = {};
      const userConnectedSockets = allConnectedSocket[JSON.stringify(user?.id)];

      const newConnectionKeys = Object.keys(userConnectedSockets).filter(
        (key) => key !== socket.id
      );
      newConnectionKeys.forEach((key) => {
        newConnection[key] = userConnectedSockets[key];
      });
      allConnectedSocket[JSON.stringify(user?.id)] = newConnection;
    });

    socket.on("connect_error", (err) => {
      // the reason of the error, for example "xhr poll error"
      console.log("Socket message error");
      console.log(err.message);

      // some additional description, for example the status code of the initial HTTP response
      console.log("Socket description error");
      console.log(err.description);

      // some additional context, for example the XMLHttpRequest object
      console.log("Socket context error");
      console.log(err.context);
    });
  }
  if (!user) {
    socket.disconnect();
  }
});
