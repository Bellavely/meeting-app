import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import { routes } from './routes';
import { pool } from './config/db';
import { errorMiddleware } from './middleware/errorMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(routes);

app.use(errorMiddleware);

app.get('/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(StatusCodes.OK).json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 'error', message: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
