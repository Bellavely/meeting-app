import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import { routes } from "./routes";
import { pool } from "./config/db";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { runMigrations } from "./dal/db/init-db";

dotenv.config();

const app = express();
const port = process.env.PORT ;
const allowdOrigins = process.env.CLIENT;
app.use(
  cors({
    origin: allowdOrigins,
    credentials: true,
  }),
);
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

app.listen(Number(port), process.env.HOST! ,async () => {
  console.log(`Server running on port ${port}`);
  try {
    await runMigrations();
  } catch (err) {
    console.error("Failed to run migrations on startup:", err);
  }
});
