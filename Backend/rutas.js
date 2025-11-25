import pkg from 'express';
import multer from 'multer';
const upload = multer();
const { Router } = pkg;

const setuprouter = ({ login, signup, authentication, getevents, permision, redirectwithgoogle, createevents, deleteevents, updateevents, seefile, uploadfile, createchat, sendmessage, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers, createproject, getprojects, getproject, updateproject, invitetoproject, joinproject, createtarea, gettareas, gettarea, updatetarea, deletetarea, getpersonalizaciones, updatepersonalizaciones, deletepersonalizaciones, save, sendToPython, saveResponse, fetchPages, getDataForScheduling, sendToPythonToo, updateSchedule, updateuserprofile, deletefile, markmessageasread, getmessagereaders, deletechat, renamechat, getprojectchats, getprojectfiles, getprojectmembers, removefromproject, deleteproject, getuserinvitations, resendinvitation, deleteaccount, getcurrentuser, transferprojectownership, reassignmembertasks,  addmembertochat,  deletemessage, removememberfromchat }) => {
    console.log("[DEBUG] setuprouter called");
    console.log("[DEBUG] signup function:", typeof signup);
    console.log("[DEBUG] login function:", typeof login);
    console.log("[DEBUG] getcurrentuser function:", typeof getcurrentuser);
    console.log("[DEBUG] updateuserprofile function:", typeof updateuserprofile);

    const router = Router();

    router.get("/", (req, res) => {
        res.json({
            message: "Backend server is running",
            status: "OK",
            endpoints: {
                auth: [
                "POST /users/login",
                "POST /users/signup",
                "GET /auth/google",
                "GET /auth/google/callback",
                "PUT /api/users/me",
                "GET /api/users/me",
                "DELETE /api/users/me",
                "PUT /api/projects/:proyectoId/transfer-ownership",
                ],
                calendar: [
                "GET /api/calendar/events",
                "POST /api/calendar/events",
                "DELETE /api/calendar/events/:eventId",
                "PUT /api/calendar/events/:eventId",
                ],
                files: [
                "GET /api/files/:nombrearchivo",
                "POST /api/files/projects/:proyectoId",
                "DELETE /api/files/:nombrearchivo",
                ],
                chat: [
                "POST /api/projects/:proyectoId/chat/create",
                "POST /api/chat/:chatId/messages",
                "GET /api/chat/:chatId/messages",
                "PUT /api/messages/:messageId/read",
                "GET /api/chats",
                "GET /api/chat/:chatId/members",
                "POST /api/messages/:messageId/read",
                "GET /api/messages/:messageId/readers",
                "DELETE /api/chats/:chatId",
                "PUT /api/chats/:chatId",
                ],
                projects: [
                "POST /api/projects",
                "GET /api/projects",
                "GET /api/projects/:proyectoId",
                "PUT /api/projects/:proyectoId",
                "PUT /api/invitations/:codigo/resend",
                "POST/api/projects/:proyectoId/invite",
                "POST /api/projects/join",
                "GET /api/projects/:proyectoId/chats",
                "GET /api/projects/:proyectoId/files",
                "GET /api/projects/:proyectoId/members",
                "DELETE /api/projects/:proyectoId",
                "DELETE /api/projects/:proyectoId/members/:personaID",
                "GET /api/invitations",
                "PUT /api/projects/:proyectoId/members/:personaId/reassign-tasks",
                ],
                tasks: [
                "POST /api/projects/:proyectoId/tasks",
                "GET /api/projects/:proyectoId/tasks",
                "PUT /api/tasks/:tareaId",
                "DELETE /api/tasks/:tareaId",
                ],
                customizations: ["GET /api/customizations", "PUT /api/customizations", "DELETE /api/customizations"],
                ia: [
                "POST /api/ia/analize/pages",
                "GET /api/ia/analize/pages",
                "GET /api/ia/analize/pages/:paginaId",
                "PUT /api/ia/analize/pages/:paginaId/response",
                "GET /api/ia/organize/projects/:proyectoId/data",
                "PUT /api/ia/organize/projects/:proyectoId/schedule",
                ],
                websocket: "ws://localhost:3000/chat",
            },
        });
    });

    router.post(
        "/users/login",
        upload.none(),
        (req, res, next) => {
            console.log("[v0] Login middleware - req.body:", req.body)
            console.log("[v0] Content-Type:", req.headers["content-type"])
            next()
        },
        login,
    )

    router.put(
        "/api/users/me",
        authentication,
        upload.none(),
        (req, res, next) => {
            console.log("[v0] PUT /api/users/me - After authentication and upload.none()")
            console.log("[v0] req.body:", req.body)
            console.log("[v0] req.body type:", typeof req.body)
            console.log("[v0] req.body keys:", Object.keys(req.body || {}))
            console.log("[v0] Content-Type:", req.headers["content-type"])
            next()
        },
        updateuserprofile,
    );
 //   router.post("/users/login", upload.none(), login);
    router.post("/users/signup", upload.single("foto_perfil"), signup);
    router.get("/api/users/me", authentication, getcurrentuser);
 //   router.put("/api/users/me", authentication, upload.none(), updateuserprofile)
    router.delete("/api/users/me", authentication, deleteaccount);
    router.get("/auth/google", authentication, redirectwithgoogle);
    router.get("/auth/google/callback", permision);
    router.get("/api/calendar/events", authentication, getevents);
    router.post("/api/calendar/events", authentication, createevents);
    router.put("/api/calendar/events/:eventId", authentication, updateevents);
    router.delete("/api/calendar/events/:eventId", authentication, deleteevents);
    router.get("/api/files/:nombrearchivo", authentication, seefile);
    router.post("/api/files/projects/:proyectoId", authentication, uploadfile);
    router.delete("/api/files/:nombrearchivo", authentication, deletefile);
    router.post("/api/projects/:proyectoId/chat/create", authentication, createchat);
    router.get("/api/chats", authentication, getchatperperson);
    router.get("/api/chat/:chatId/members", authentication, getchatmembers);
    router.get("/api/chat/:chatId/messages", authentication, getchatmessages);
    router.post("/api/chat/:chatId/messages", authentication, sendmessage);
    router.put("/api/chats/:chatId", authentication, renamechat);
    router.delete("/api/chats/:chatId", authentication, deletechat);
    router.post("/api/chats/:chatId/members", authentication, addmembertochat);
    router.delete("/api/chats/:chatId/members/:personaId", authentication, removememberfromchat);
    router.put("/api/messages/:messageId/read", authentication, updatemessagestatus);
    router.post("/api/messages/:messageId/read", authentication, markmessageasread);
    router.get("/api/messages/:messageId/readers", authentication, getmessagereaders);
    router.delete("/api/messages/:messageId", authentication, deletemessage);
    router.post("/api/projects", authentication, createproject);
    router.get("/api/projects", authentication, getprojects);
    router.get("/api/projects/:proyectoId", authentication, getproject);
    router.put("/api/projects/:proyectoId", authentication, updateproject);
    router.delete("/api/projects/:proyectoId", authentication, deleteproject);
    router.post("/api/projects/:proyectoId/invite", authentication, invitetoproject);
    router.post("/api/projects/join", authentication, joinproject);
    router.get("/api/projects/:proyectoId/chats", authentication, getprojectchats);
    router.get("/api/projects/:proyectoId/files", authentication, getprojectfiles);
    router.get("/api/projects/:proyectoId/members", authentication, getprojectmembers);
    router.delete("/api/projects/:proyectoId/members/:personaId", authentication, removefromproject);
    router.put("/api/projects/:proyectoId/transfer-ownership", authentication, transferprojectownership);
    router.put("/api/projects/:proyectoId/members/:personaId/reassign-tasks", authentication, reassignmembertasks);
    router.get("/api/invitations", authentication, getuserinvitations);
    router.put("/api/invitations/:codigo/resend", authentication, resendinvitation);
    router.post("/api/projects/:proyectoId/tasks", authentication, createtarea);
    router.get("/api/projects/:proyectoId/tasks", authentication, gettareas);
    router.get("/api/tasks/:tareaId", authentication, gettarea);
    router.put("/api/tasks/:tareaId", authentication, updatetarea);
    router.delete("/api/tasks/:tareaId", authentication, deletetarea);
    router.get("/api/customizations", authentication, getpersonalizaciones);
    router.put("/api/customizations", authentication, updatepersonalizaciones);
    router.delete("/api/customizations", authentication, deletepersonalizaciones);
    router.post("/api/ia/analize/pages", authentication, save);
    router.get("/api/ia/analize/pages", authentication, fetchPages);
    router.get("/api/ia/analize/pages/:paginaId", authentication, sendToPython);
    router.put("/api/ia/analize/pages/:paginaId/response", authentication, saveResponse);
    router.get("/api/ia/organize/projects/:proyectoId/data", authentication, getDataForScheduling);
    router.post("/api/ia/organize/projects/:proyectoId/process", authentication, sendToPythonToo);
    router.put("/api/ia/organize/projects/:proyectoId/schedule", authentication, updateSchedule);

    console.log("[DEBUG] All routes registered. Total routes:", router.stack?.length);

    return router;
}

export default setuprouter;