import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import fleetRouter from './routes/fleet';
import matchesRouter from './routes/matches';
import requestsRouter from './routes/requests';
import bookingsRouter from './routes/bookings';
import usersRouter from './routes/users';
import leaveRequestsRouter from './routes/leave-requests';
import auditLogsRouter from './routes/audit-logs';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/fleet', fleetRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/users', usersRouter);
app.use('/api/leave-requests', leaveRequestsRouter);
app.use('/api/audit-logs', auditLogsRouter);

// Centralized error handler — all routes throw to here instead of handling inline
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message ?? 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
