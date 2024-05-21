import express, { application } from "express";
import logger from "morgan";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

import usersRoutes from "./routes/users.routes.js";
import usersPrivate from "./routes/userPrivate.routes.js";

const app = express();
const server = http.createServer(app);

import "./config/db.config.js";

app.use(cors());

app.use(logger("dev"));
app.use(express.json());

app.use("/", usersRoutes);
app.use("/user/private", usersPrivate);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("Token recebido no handshake:", token);
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    console.log("Usuário autenticado: ", decoded);
    next();
  } catch (err) {
    console.error("Erro de autenticação: Token inválido", err);
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`Novo usuário conectado: ${socket.id} (user:${socket.user.id})`);

  socket.on("disconnect", () => {
    console.log(`Usuário desconectado: ${socket.id}`);
  });

  socket.on("sendMessage", ({ message }, callback) => {
    io.emit("receiveMessage", { userId: socket.user.id, message });
    callback();
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
