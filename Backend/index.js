import { PrismaClient } from '@prisma/client';
import { default as express } from 'express';
import dotenv from 'dotenv';
import expressWs from 'express-ws';


import setuprouter from './rutas.js';
import setupsesiones from './sesiones/sesiones.js';
import setupcalendario from './calendario/calendario.js';
import setupautenticacion from './autenticacion.js';
import setuparchivos from './archivos/archivos.js';
import setupwebsocketserver from './chats/websocket.js';
import setupchat from './chats/chat.js';
import setupprojectos from './proyectos/proyectos.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'contrasenia-jeje';
const prisma = new PrismaClient();
const app = express();
const wsInstance = expressWs(app);

const { login, signup } = setupsesiones(JWT_SECRET);
const { authentication } = setupautenticacion(JWT_SECRET);
const { authorization, getatoken, lookfortoken, permision, getevents, redirectwithgoogle, createevents, deleteevents, updateevents } = setupcalendario();
const { seefile, uploadfile } = setuparchivos();
const { createchat, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers } = setupchat();
const { createproject, getprojects, getproject, updateproject, invitetoproject, joinproject } = setupproyectos()
const router = setuprouter({ login, signup, authentication, getevents, permision, redirectwithgoogle, createevents, deleteevents, updateevents, seefile, uploadfile, createchat, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers, createproject, getprojects, getproject, updateproject, invitetoproject, joinproject,});

app.use(express.json());
app.use(router);

setupwebsocketserver(app, JWT_SECRET, prisma, wsInstance);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server available at ws://localhost:${PORT}/chat`)
});
server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Please:`)
      console.error(`1. Kill the existing process, or`)
      console.error(`2. Set a different PORT in your .env file`)
      process.exit(1)
    } else {
      console.error("Server error:", err)
    }
 });


export default app;
