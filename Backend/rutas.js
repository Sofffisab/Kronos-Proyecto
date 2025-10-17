import pkg from 'express';
const { Router } = pkg;


const setuprouter = ({ login, signup, authentication, getevents, permision, redirectwithgoogle, createevents, deleteevents, updateevents, seefile, uploadfile, createchat, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers}) => {
    const router = Router();


    router.get("/", (req, res) => {
        res.json({
            message: "Backend server is running",
            status: "OK",
            endpoints: {
                auth: ["POST /users/login", "POST /users/signup", "GET /auth/google", "GET /auth/google/callback"],
                calendar: [
                "GET /api/calendar/events", "POST /api/calendar/events", "DELETE /api/calendar/events/:eventId", "PUT /api/calendar/events/:eventId",
                ],
                files: ["GET /api/files/:nombrearchivo", "POST /api/files/projects/:proyectoId"],
                chat: [
                "POST /projects/:proyectoId/chat/create", "GET /chat/:chatId/messages", "PUT /messages/:messageId/read", "GET /chats", "GET /chat/:chatId/members",
                ],
                websocket: "ws://localhost:3000/chat",
            },
        })
    })


    router.post("/users/login", login);
    router.post("/users/signup", signup);
    router.get("/auth/google/callback", authentication, permision);
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


    return router;
};


export default setuprouter;
