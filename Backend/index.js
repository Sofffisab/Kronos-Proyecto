import { prisma } from './prisma/prisma.js';
import { default as express } from 'express';
import dotenv from 'dotenv';
import expressWs from 'express-ws';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import setuprouter from './rutas.js';
import setupsesiones from './sesiones/sesiones.js';
import setupcalendario from './calendario/calendario.js';
import setupautenticacion from './autenticacion.js';
import setuparchivos from './archivos/archivos.js';
import setupwebsocketserver from './chats/websocket.js';
import setupchat from './chats/chat.js';
import setupproyectos from './proyectos/proyectos.js';
import setuptareas from './proyectos/tareas.js';
import setuppersonalizaciones from './personalizaciones/personalizaciones.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
};

const app = express();
const wsInstance = expressWs(app);

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }),
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);

const { login, signup } = setupsesiones(JWT_SECRET);
const { authentication } = setupautenticacion(JWT_SECRET);
const { authorization, getatoken, lookfortoken, permision, getevents, redirectwithgoogle, createevents, deleteevents, updateevents } = setupcalendario();
const { seefile, uploadfile } = setuparchivos();
const { createchat, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers } = setupchat();
const { createtarea, gettareas, updatetarea, deletetarea } = setuptareas();
const { getpersonalizaciones, updatepersonalizaciones, deletepersonalizaciones } = setuppersonalizaciones();
const { createproject, getprojects, getproject, updateproject, invitetoproject, joinproject } = setupproyectos()
const router = setuprouter({ login, signup, authentication, getevents, permision, redirectwithgoogle, createevents, deleteevents, updateevents, seefile, uploadfile, createchat, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers, createproject, getprojects, getproject, updateproject, invitetoproject, joinproject, createtarea, gettareas, updatetarea, deletetarea, getpersonalizaciones, updatepersonalizaciones, deletepersonalizaciones });

console.log('[DEBUG] Router created:', router);
console.log('[DEBUG] Router stack:', router.stack?.length, 'routes');

setupwebsocketserver(app, JWT_SECRET, prisma, wsInstance);

app.use(router);
console.log('[DEBUG] Router mounted to app');

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/chat`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please:`);
    console.error(`1. Kill the existing process, or`);
    console.error(`2. Set a different PORT in your .env file`);
     process.exit(1);
  } else {
    console.error("Server error:", err);
  };
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
