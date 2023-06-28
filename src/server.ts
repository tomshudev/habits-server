import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { Context, createContext } from "../graphql/context";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import {
  TokenMessage,
  getMessaging,
  TopicMessage,
} from "firebase-admin/messaging";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import prisma from "../lib/prisma";

const start = async () => {
  const server = new ApolloServer<Context>({ schema });

  const { url } = await startStandaloneServer(server, {
    context: createContext,
    listen: { port: 4000 },
  });

  console.log(`\
  🚀 Server ready at: ${url}
  ⭐️ See sample queries: http://pris.ly/e/ts/graphql-nexus#using-the-graphql-api
  `);

  // const app = express();
  const httpServer = createServer();

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", async (socket) => {
    console.log("a new connection has been established");

    const user = await prisma.user.findFirst({
      where: {
        email: socket.handshake.auth.email,
      },
    });

    console.log("found user!", user);

    // setInterval(async () => {
    //   const habits = await prisma.habit.findMany({
    //     where: {
    //       userId: user?.id,
    //     },
    //   });

    //   habits.forEach((habit) => {
    //     socket.emit("message", habit.id, habit.category);
    //   });
    // }, 15000);

    // setInterval(() => {
    //   socket.emit("message", { a: "b" });
    // }, 5000);
  });

  const wsServer = httpServer.listen(4001);

  console.log("😍 WebSocketServer is ready on http://localhost:4001");

  // const registrationToken =
  //   "cAgFv7QlkdPIqNdvYpQZ_w:APA91bHUhorFPVzf77w8CYXdaCEAYI4IBhg24789jNE_Rl7vWk_ck6k0_DLnpcfpb1m-jH8oxhPce6hP4WFsYe7CkbIINCBlYsRfazssaeJeUnFdDSYjdw_Qx-xk_aViSu1x6h9XMggH";

  // const app = initializeApp({
  //   credential: applicationDefault(),
  // });

  // // const analytics = getAnalytics(app)
  // const messaging = getMessaging();

  // const message = {
  //   notification: {
  //     title: "850",
  //     body: "2:45",
  //   },
  //   token: registrationToken,
  // };

  // setInterval(() => {
  //   // Send a message to the device corresponding to the provided
  //   // registration token.
  //   messaging
  //     .send(message)
  //     .then((response) => {
  //       // Response is a message ID string.
  //       console.log("Successfully sent message:", response);
  //     })
  //     .catch((error) => {
  //       console.log("Error sending message:", error);
  //     });
  // }, 5000);
};

start();
