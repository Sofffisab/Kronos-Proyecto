import { prisma } from '../prisma/prisma.js';

const setupchat = () => {

    const createchat = async (req, res) => {
        const { nombre } = req.body;
        const personaId = req.personaId;
        const { proyectoId } = req.params;

        if (!nombre || !proyectoId || !personaId) {
            return res.status(400).json({ error: "Missing required fields" });
        };

        try {
            const ismember = await prisma.tiene.findFirst({
                where: {
                    id_persona: personaId,
                    id_proyecto: parseInt(proyectoId, 10)
                }
            });

            if (!ismember) {
                return res.status(403).json({ error: "You don't have permission to create a chat in this project" });
            };

            const newchat = await prisma.chat.create({
                data: {
                    nombre: nombre,
                    id_proyecto: parseInt(proyectoId, 10),
                },
            });

            const projectMembers = await prisma.tiene.findMany({
                where: {
                    id_proyecto: parseInt(proyectoId, 10)
                },
                select: {
                    id_persona: true
                }
            });

            await prisma.tiene_pc.createMany({
                data: projectMembers.map(member => ({
                    id_persona: member.id_persona,
                    id_chat: newchat.id
                }))
            });

            await prisma.tiene_rc.create({
                data: {
                    id_proyecto: parseInt(proyectoId, 10),
                    id_chat: newchat.id
                }
            });

            res.status(201).json({ message: "Chat created successfully", chat: newchat });
        } catch (error) {
            console.error("Error creating chat:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const getchatmessages = async (req, res) => {
        const { chatId } = req.params;
        const personaId = req.personaId;

        if (!chatId || !personaId) {
            return res.status(400).json({ error: "Missing required fields" });
        };

        try {
            const hasaccess = await prisma.tiene_pc.findFirst({
                where: {
                    id_persona: personaId,
                    id_chat: parseInt(chatId, 10)
                }
            });

            if (!hasaccess) {
                return res.status(403).json({ error: "You don't have access to this chat" });
            };

            const messages = await prisma.mensajes.findMany({
                where: {
                    id_chat: parseInt(chatId, 10)
                },
                orderBy: {
                    id: 'asc'
                }
            });

            res.status(200).json(messages);

        } catch (error) {
            console.error("Error getting messages:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const updatemessagestatus = async (req, res) => {
        const { messageId } = req.params;
        const { estado } = req.body; 
        const personaId = req.personaId;
        
        if (!messageId || !estado) {
            return res.status(400).json({ error: "Missing required fields" });
        };

        try {
            const message = await prisma.mensajes.findUnique({
                where: {
                    id: parseInt(messageId, 10)
                }
            });

            if (!message) {
                return res.status(404).json({ error: "Message not found" });
            };

            const hasaccess = await prisma.tiene_pc.findFirst({
                where: {
                    id_persona: personaId,
                    id_chat: message.id_chat
                }
            });

            if (!hasaccess) {
                return res.status(403).json({ error: "You don't have permission to update this message" });
            };

            const updatedmessage = await prisma.mensajes.update({
                where: {
                    id: parseInt(messageId, 10)
                },
                data: {
                    estado: estado
                }
            });

            res.status(200).json({ message: "Message status updated successfully", updatedmessage });
        } catch (error) {
            console.error("Error updating message status:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const getchatperperson = async (req, res) => {
        const personaId = req.personaId;

        try {
            const chats = await prisma.chat.findMany({
                where: {
                    tiene_pc: {
                        some: {
                            id_persona: personaId
                        }
                    }
                },
                include: {
                    mensajes: {
                        take: 1,
                        orderBy: {
                            fecha_envio: 'desc'
                        }
                    }
                }
            });

            res.status(200).json(chats);
        } catch (error) {
            console.error("Error getting person chats:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const getchatmembers = async (req, res) => {
        const { chatId } = req.params;
        const personaId = req.personaId;

        if (!chatId) {
            return res.status(400).json({ error: "no chat available found" });
        };

        try {
            const hasAccess = await prisma.tiene_pc.findFirst({
                where: {
                    id_persona: personaId,
                    id_chat: parseInt(chatId, 10)
                }
            });

            if (!hasAccess) {
                return res.status(403).json({ error: "You don't have access to this chat" });
            };

            const members = await prisma.tiene_pc.findMany({
                where: {
                    id_chat: parseInt(chatId, 10)
                },
                include: {
                    persona: {
                        select: {
                            id: true,
                            usuario: true,
                            nombre: true
                        }
                    }
                }
            });

            res.status(200).json(members.map(m => m.persona));
        } catch (error) {
            console.error("Error getting chat members:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    return { createchat, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers };
};

export default setupchat;