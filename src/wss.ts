import express from "express";
import { Server } from "socket.io";

const app = express();

const server = app.listen(4001);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a new connection has been established");

  setInterval(() => {
    socket.emit("message", { a: "b" });
  }, 5000);
});
