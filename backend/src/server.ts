import express from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import { routes } from "./routes";
import { pool } from "./config/db";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { runMigrations } from "./dal/db/init-db";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowdOrigins = process.env.CLIENT;
const server = http.createServer(app);
app.use(
  cors({
    origin: allowdOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const io = new Server(server, {
  cors: {
    origin: allowdOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

app.set("io", io);
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log("Socket connection rejected: No token provided");
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    (socket as any).userId = decoded.id;
    next();
  } catch (err) {
    console.log("Socket connection rejected: Invalid token");
    return next(new Error("Authentication error: Invalid token"));
  }
});
io.on("connection", (socket) => {
  const userId = (socket as any).userId;
  socket.join(userId);
});

app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);

app.use(errorMiddleware);

app.get("/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(StatusCodes.OK).json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: (err as Error).message });
  }
});

server.listen(Number(port), process.env.HOST!, async () => {
  console.log(`Server running on port ${port}`);
  try {
    await runMigrations();
  } catch (err) {
    console.error("Failed to run migrations on startup:", err);
  }
});
