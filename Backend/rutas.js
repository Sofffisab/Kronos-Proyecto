import pkg from 'express';
import multer from 'multer';
const upload = multer()
const { Router } = pkg;

const setuprouter = ({ login, signup, authentication, getevents, permision, redirectwithgoogle, createevents, deleteevents, updateevents, seefile, uploadfile, createchat, sendmessage, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers, createproject, getprojects, getproject, updateproject, invitetoproject, joinproject, createtarea, gettareas, gettarea, updatetarea, deletetarea, getpersonalizaciones, updatepersonalizaciones, deletepersonalizaciones, save, lookfor, saveresponse, getdata, updatetime }) => { 
    console.log('[DEBUG] setuprouter called');
    console.log('[DEBUG] signup function:', typeof signup);
    console.log('[DEBUG] login function:', typeof login);
    
    const router = Router();


    router.get("/", (req, res) => {
        res.json({
            message: "Backend server is running",
            status: "OK",
            endpoints: {
                auth: ["POST /users/login", "POST /users/signup", "GET /auth/google", "GET /auth/google/callback"],
                calendar: ["GET /api/calendar/events", "POST /api/calendar/events", "DELETE /api/calendar/events/:eventId", "PUT /api/calendar/events/:eventId"],
                files: ["GET /api/files/:nombrearchivo", "POST /api/files/projects/:proyectoId"],
                chat: [ "POST /projects/:proyectoId/chat/create", "GET /chat/:chatId/messages", "PUT /messages/:messageId/read", "GET /chats", "GET /chat/:chatId/members"],
                projects: ["POST /api/projects", "GET /api/projects", "GET /api/projects/:proyectoId", "PUT /api/projects/:proyectoId", "POS/api/projects/:proyectoId/invite", "POST /api/projects/join"],
                tasks: ["POST /api/projects/:proyectoId/tasks", "GET /api/projects/:proyectoId/tasks", "PUT /api/tasks/:tareaId", "DELETE /api/tasks/:tareaId"],
                customizations: ["GET /api/customizations", "PUT /api/customizations", "DELETE /api/customizations"],
                ia: ["POST /api/ia/analize/pages", "GET /api/ia/analize/pages/:paginaId", "PUT /api/ia/analize/pages/:paginaId/response", "GET /api/ia/organize/projects/:proyectoId/data", "PUT /api/ia/organize/projects/:proyectoId/schedule"],
                websocket: "ws://localhost:3000/chat",
            },
        });
    });


    router.post("/users/login", login);
    router.post("/users/signup", upload.single('foto_perfil'), signup);
    router.get("/auth/google/callback", permision);
    router.get("/api/calendar/events", authentication, getevents);
    router.get('/auth/google', redirectwithgoogle);
    router.post("/api/calendar/events", authentication, createevents);
    router.delete("/api/calendar/events/:eventId", authentication, deleteevents);
    router.put("/api/calendar/events/:eventId", authentication, updateevents);
    router.get("/api/files/:nombrearchivo", authentication, seefile);
    router.post("/api/files/projects/:proyectoId", authentication, uploadfile);
    router.post("/projects/:proyectoId/chat/create", authentication, createchat);
    router.get("/chat/:chatId/messages", authentication, getchatmessages);
    router.put("/messages/:messageId/read", authentication, updatemessagestatus);
    router.get("/chats", authentication, getchatperperson);
    router.get("/chat/:chatId/members", authentication, getchatmembers);
    router.post("/api/projects", authentication, createproject);
    router.get("/api/projects", authentication, getprojects);
    router.get("/api/projects/:proyectoId", authentication, getproject);
    router.put("/api/projects/:proyectoId", authentication, updateproject);
    router.post("/api/projects/:proyectoId/invite", authentication, invitetoproject);
    router.post("/api/projects/join", authentication, joinproject);
    router.post("/api/projects/:proyectoId/tasks", authentication, createtarea);
    router.get("/api/projects/:proyectoId/tasks", authentication, gettareas);
    router.get("/api/tasks/:tareaId", authentication, gettarea);
    router.put("/api/tasks/:tareaId", authentication, updatetarea);
    router.delete("/api/tasks/:tareaId", authentication, deletetarea);
    router.get("/api/customizations", authentication, getpersonalizaciones);
    router.put("/api/customizations", authentication, updatepersonalizaciones);
    router.delete("/api/customizations", authentication, deletepersonalizaciones);
    router.post("/api/ia/analize/pages", authentication, save)
    router.get("/api/ia/analize/pages/:paginaId", authentication, lookfor)
    router.put("/api/ia/analize/pages/:paginaId/response", authentication, saveresponse)
    router.get("/api/ia/organize/projects/:proyectoId/data", authentication, getdata)
    router.put("/api/ia/organize/projects/:proyectoId/schedule", authentication, updatetime)

    console.log('[DEBUG] All routes registered. Total routes:', router.stack?.length);
    
    return router;
};


export default setuprouter;