import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;
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
// import setupprojects from './proyectos/proyectos.js';
// import setuppersonalize from './personalizaciones/personalizaciones.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'contrasenia-jeje';
const prisma = new PrismaClient();
const app = express();
expressWs(app); 
const wss = app.getWss();

const { login, signup } = setupsesiones(JWT_SECRET);
const { authentication } = setupautenticacion(JWT_SECRET);
const { authorization, getatoken, lookfortoken, permision, getevents, redirectwithgoogle, createevents, deleteevents, updateevents } = setupcalendario();
const { seefile, uploadfile } = setuparchivos();
const { createchat, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers } = setupchat(prisma);
const router = setuprouter({ login, signup, authentication, getevents, permision, redirectwithgoogle, createevents, deleteevents, updateevents, seefile, uploadfile, createchat, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers });

app.use(express.json());
app.use(router);

setupwebsocketserver(wss, JWT_SECRET, prisma);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;