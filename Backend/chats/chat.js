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
                    id_proyecto: Number.parseInt(proyectoId, 10),
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
                data: projectMembers.map((member) => ({
                    id_persona: member.id_persona,
                    id_chat: newchat.id
                }))
            });

            await prisma.tiene_rc.create({
                data: {
                    id_proyecto: Number.parseInt(proyectoId, 10),
                    id_chat: newchat.id
                }
            });

            res.status(201).json({ message: "Chat created successfully", chat: newchat });
        } catch (error) {
            console.error("Error creating chat:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const sendmessage = async (req, res) => {
    const { chatId } = req.params
    const { mensaje } = req.body
    const personaId = req.personaId

    if (!chatId || !mensaje) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    try {
      const hasaccess = await prisma.tiene_pc.findFirst({
        where: {
          id_persona: personaId,
          id_chat: Number.parseInt(chatId, 10),
        },
      })

      if (!hasaccess) {
        return res.status(403).json({ error: "You don't have access to this chat" })
      }

      const newmessage = await prisma.mensajes.create({
        data: {
          id_chat: Number.parseInt(chatId, 10),
          id_persona: personaId,
          mensaje: mensaje,
          estado: "sent",
        },
      })

      res.status(201).json({ message: "Message sent successfully", mensaje: newmessage })
    } catch (error) {
      console.error("Error sending message:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
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

    const markmessageasread = async (req, res) => {
        const { messageId } = req.params;
        const personaId = req.personaId;

        try {
            if (!messageId) {
                return res.status(400).json({ error: "missing data" });
            };

            const message = await prisma.mensajes.findUnique({
                where: {
                    id: Number.parseInt(messageId, 10),
                },
            });

            if (!message) {
                return res.status(404).json({ error: "Message not found" });
            };

            const hasaccess = await prisma.tiene_pc.findFirst({
                where: {
                id_persona: personaId,
                id_chat: message.id_chat,
                },
            });

            if (!hasaccess) {
                return res.status(403).json({ error: "You don't have permission to read this message" });
            };

            const alreadyread = await prisma.leido.findUnique({
                where: { 
                    id_mensaje_id_persona: {
                        id_mensaje: Number.parseInt(messageId, 10),
                        id_persona: personaId,
                    },
                },
            });

            if (alreadyread) {
                return res.status(200).json({ message: "Message already marked as read" });
            } else {
                await prisma.leido.create({
                    data: {
                        id_mensaje: Number.parseInt(messageId, 10),
                        id_persona: personaId,
                    },
                });
                res.status(201).json({ message: "Message marked as read successfully" });
            }

        } catch (error) {
            console.error("Error marking message as read:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const getmessagereaders = async (req, res) => {
        const { messageId } = req.params;
        const personaId = req.personaId;

        try {
            if (!messageId) {
                return res.status(400).json({ error: "missing data" });
            };

            const message = await prisma.mensajes.findUnique({
                where: {
                id: Number.parseInt(messageId, 10),
                },
            });

            if (!message) {
                return res.status(404).json({ error: "Message not found" });
            };

            const hasaccess = await prisma.tiene_pc.findFirst({
                where: {
                id_persona: personaId,
                id_chat: message.id_chat,
                },
            });

            if (!hasaccess) {
                return res.status(403).json({ error: "You don't have permission to view this information" });
            };

            const readers = await prisma.leido.findMany({
                where: {
                id_mensaje: Number.parseInt(messageId, 10),
                },
                include: {
                    persona: {
                        select: {
                        id: true,
                        usuario: true,
                        nombre: true,
                        },
                    },
                },
            });
            res.status(200).json(readers.map((r) => r.persona));

        } catch (error) {
            console.error("Error getting message readers:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const getchatperperson = async (req, res) => {
        const personaId = req.personaId;

        try {
            const chats = await prisma.chat.findMany({
                where: {
                    personas_tiene: {
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

    const deletechat = async (req, res) => {
        const { chatId } = req.params;
        const personaId = req.personaId;

        try {
            if (!chatId) {
                return res.status(400).json({ error: "missing data" });
            };

            const chat = await prisma.chat.findUnique({
                where: {
                    id: Number.parseInt(chatId, 10),
                },
                include: {
                    proyecto: true,
                },
            });

            if (!chat) {
                return res.status(404).json({ error: "Chat not found" });
            };

            const ismember = await prisma.tiene.findFirst({
                where: {
                    id_persona: personaId,
                    id_proyecto: chat.id_proyecto,
                },
            });

            if (!ismember) {
                return res.status(403).json({ error: "You don't have permission to delete this chat" });
            };

            await prisma.leido.deleteMany({
                where: {
                    mensaje: {
                        id_chat: Number.parseInt(chatId, 10),
                    },
                },
            });

            await prisma.mensajes.deleteMany({
                where: {
                    id_chat: Number.parseInt(chatId, 10),
                },
            });

            await prisma.tiene_pc.deleteMany({
                where: {
                    id_chat: Number.parseInt(chatId, 10),
                },
            });

            await prisma.tiene_rc.deleteMany({
                where: {
                    id_chat: Number.parseInt(chatId, 10),
                },
            });

            await prisma.chat.delete({
                where: {
                    id: Number.parseInt(chatId, 10),
                },
            });

            res.status(200).json({ message: "Chat deleted successfully" });
        } catch (error) {
            console.error("Error deleting chat:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const renamechat = async (req, res) => {
        const { chatId } = req.params;
        const { nombre } = req.body;
        const personaId = req.personaId;

        try {
            if (!chatId || !nombre) {
                return res.status(400).json({ error: "missing data" });
            };

            const chat = await prisma.chat.findUnique({
                where: {
                    id: Number.parseInt(chatId, 10),
                },
            });

            if (!chat) {
                return res.status(404).json({ error: "Chat not found" });
            };

            const hasaccess = await prisma.tiene_pc.findFirst({
                where: {
                    id_persona: personaId,
                    id_chat: Number.parseInt(chatId, 10),
                },
            });

            if (!hasaccess) {
                return res.status(403).json({ error: "You don't have permission to rename this chat" });
            };

            const updatedchat = await prisma.chat.update({
                where: { id: Number.parseInt(chatId, 10) },
                data: { nombre: nombre },
            });

            res.status(200).json({ message: "Chat renamed successfully", chat: updatedchat });
        } catch (error) {
            console.error("Error renaming chat:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const addmembertochat = async (req, res) => {
        const { chatId } = req.params;
        const { id_persona } = req.body;
        const personaId = req.personaId;

        try {
            if (!chatId || !id_persona) {
                return res.status(400).json({ error: "missing data" });
            };

            const chat = await prisma.chat.findUnique({
                where: {
                    id: Number.parseInt(chatId, 10),
                },
                include: {
                    proyecto: true,
                },
            });

            if (!chat) {
                return res.status(404).json({ error: "Chat not found" });
            };

            const isrequestermember = await prisma.tiene.findFirst({
                where: {
                    id_persona: personaId,
                    id_proyecto: chat.id_proyecto,
                },
            });

            if (!isrequestermember) {
                return res.status(403).json({ error: "You don't have permission to add members to this chat" });
            };

            const isnewmemberinproject = await prisma.tiene.findFirst({
                where: {
                    id_persona: Number.parseInt(id_persona, 10),
                    id_proyecto: chat.id_proyecto,
                },
            });

            if (!isnewmemberinproject) {
                return res.status(400).json({ error: "Person is not a member of this project" });
            };

            const alreadyinchat = await prisma.tiene_pc.findFirst({
                where: {
                    id_persona: Number.parseInt(id_persona, 10),
                    id_chat: Number.parseInt(chatId, 10),
                },
            });

            if (alreadyinchat) {
                return res.status(400).json({ error: "Person is already a member of this chat" });
            };

            await prisma.tiene_pc.create({
                data: {
                    id_persona: Number.parseInt(id_persona, 10),
                    id_chat: Number.parseInt(chatId, 10),
                },
            });

            res.status(201).json({ message: "Member added to chat successfully" });
        } catch (error) {
            console.error("Error adding member to chat:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const deletemessage = async (req, res) => {
        const { messageId } = req.params;
        const personaId = req.personaId;

        try {
            if (!messageId) {
                return res.status(400).json({ error: "missing data" });
            };

            const message = await prisma.mensajes.findUnique({
                where: {
                    id: Number.parseInt(messageId, 10),
                },
            });

            if (!message) {
                return res.status(404).json({ error: "Message not found" });
            };

            if (message.id_persona !== personaId) {
                return res.status(403).json({ error: "You can only delete your own messages" });
            };

            await prisma.leido.deleteMany({
                where: {
                    id_mensaje: Number.parseInt(messageId, 10),
                },
            });

            await prisma.mensajes.delete({
                where: {
                    id: Number.parseInt(messageId, 10),
                },
            });

            res.status(200).json({ message: "Message deleted successfully" });
        } catch (error) {
            console.error("Error deleting message:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    const removememberfromchat = async (req, res) => {
        const { chatId, personaId: memberToRemove } = req.params;
        const personaId = req.personaId;

        try {
            if (!chatId || !memberToRemove) {
                return res.status(400).json({ error: "missing data" });
            };

            const chat = await prisma.chat.findUnique({
                where: {
                    id: Number.parseInt(chatId, 10),
                },
                include: {
                    proyecto: true,
                },
            });

            if (!chat) {
                return res.status(404).json({ error: "Chat not found" });
            };

            const isrequestermember = await prisma.tiene.findFirst({
                where: {
                    id_persona: personaId,
                    id_proyecto: chat.id_proyecto,
                },
            });

            if (!isrequestermember) {
                return res.status(403).json({ error: "You don't have permission to remove members from this chat" });
            };

            const memberinchat = await prisma.tiene_pc.findFirst({
                where: {
                    id_persona: Number.parseInt(memberToRemove, 10),
                    id_chat: Number.parseInt(chatId, 10),
                },
            });

            if (!memberinchat) {
                return res.status(404).json({ error: "Member not found in this chat" });
            };

            await prisma.tiene_pc.delete({
                where: {
                    id: memberinchat.id,
                },
            });

            res.status(200).json({ message: "Member removed from chat successfully" });
        } catch (error) {
            console.error("Error removing member from chat:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    }; //bien pero no maneja eliminado y los mensajes
//
    return { createchat, sendmessage, getchatmessages, updatemessagestatus, getchatperperson, getchatmembers, markmessageasread, getmessagereaders, deletechat, renamechat, addmembertochat, deletemessage };
};

export default setupchat;