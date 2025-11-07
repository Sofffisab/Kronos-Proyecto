import { prisma } from '../prisma/prisma.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { tr } from 'zod/v4/locales';


const setupsesiones = (JWT_SECRET) => {

    const login = async (req, res) => {
        const {usuarioI, mailI, contraseniaP} = req.body;
        let persona;
        
        try {
            if (mailI) {
                persona = await prisma.persona.findUnique({ 
                    where: { mail: mailI } 
                });
            } else if (usuarioI) {
                persona = await prisma.persona.findUnique({ 
                    where: { usuario: usuarioI } 
                });
            };

            if (!persona || !contraseniaP) {
            return res.status(401).json({ error: "Wrong data" });
            };

            const contraseniaI = await argon2.verify(persona.contrasenia, contraseniaP);
            if (!contraseniaI) {
                return res.status(401).json({ error: "Wrong data" });
            };

            const token = jwt.sign({ 
                personaId: persona.id, 
                mail: persona.mail 
            }, JWT_SECRET, { 
                expiresIn: '8h' 
            });

            res.status(200).json({ 
                message: "Logged in successfully", 
                token ,
                photo: persona.foto_perfil
  ? `data:image/jpeg;base64,${Buffer.from(persona.foto_perfil).toString('base64')}`
  : null
            });

        } catch (error) {
            console.error("unsuccessful login", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
        
    };

    const signup = async (req, res) => {
        console.log('[DEBUG] Inside signup function');
        console.log('[DEBUG] Request body:', req.body);
        const {usuario, nombre, mail, contraseniaPrior} = req.body;
        const fotoBuffer = req.file?.buffer
        console.log('[DEBUG] Destructured values:', { usuario, nombre, mail, contraseniaPrior, fotoBuffer });

        try {

            if (!usuario || !nombre || !mail || !contraseniaPrior || !fotoBuffer) {
                return res.status(400).json({error: "All fields are required"});
            };

            const contrasenia = await argon2.hash(contraseniaPrior);

            const persona = await prisma.persona.create({
                data: {
                    usuario: usuario,
                    nombre: nombre,
                    mail: mail,
                    contrasenia: contrasenia,
                    foto_perfil: fotoBuffer,

                },
            });

            const token = jwt.sign({ 
                personaId: persona.id, 
                mail: persona.mail 
            }, JWT_SECRET, { 
                expiresIn: '8h' 
            });

            res.status(201).json({ message: "user created successfully", token: token, photo: persona.foto_perfil
  ? `data:image/jpeg;base64,${Buffer.from(persona.foto_perfil).toString('base64')}`
  : null
  });

        } catch (error){
            console.log('[DEBUG] Error in signup:', error);
            
            if (error.code === 'P2002') {
                return res.status(409).json({ 
                error: 'El email ya está registrado' 
                });
            }
            console.error("error signing up", error);
            res.status(500).json({ 
                error: "Internal Server Error",
                details: error.message 
            });
        };
    }
    
    const updateuserprofile = async (req, res) => {
        const personaId = req.personaId;
        const { usuario, nombre, horario_inicio, horario_fin } = req.body;

        try {
            if (!usuario && !nombre && !horario_inicio && !horario_fin) {
                return res.status(400).json({ error: "No data provided to update" });
            };

            const updateData = {};
            if (usuario) updateData.usuario = usuario;
            if (nombre) updateData.nombre = nombre;
            if (horario_inicio) updateData.horario_inicio = new Date(horario_inicio);
            if (horario_fin) updateData.horario_fin = new Date(horario_fin);

            const updatedpersona = await prisma.persona.update({
                where: { id: personaId },
                data: updateData,
                select: {
                    id: true,
                    usuario: true,
                    nombre: true,
                    mail: true,
                    horario_inicio: true,
                    horario_fin: true,
                },
            });

            res.status(200).json({ message: "User profile updated successfully", user: updatedpersona });

        } catch (error) {
            if (error.code === "P2002") {
                return res.status(409).json({ error: "Username already taken" });
            };
            console.error("Error updating user profile:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };
//
    const getcurrentuser = async (req, res) => {
        const personaId = req.personaId;

        try {
            const persona = await prisma.persona.findUnique({
                where: {
                    id: personaId,
                },
                select: {
                    id: true,
                    usuario: true,
                    nombre: true,
                    mail: true,
                    horario_inicio: true,
                    horario_fin: true,
                    foto_perfil: true,
                },
            });

            if (!persona) {
                return res.status(404).json({ error: "User not found" });
            };

            const userResponse = {
                ...persona,
                foto_perfil: persona.foto_perfil
                ? `data:image/jpeg;base64,${Buffer.from(persona.foto_perfil).toString("base64")}`
                : null,
            };

            res.status(200).json(userResponse);
        } catch (error) {
            console.error("Error getting current user:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    }

    const deleteaccount = async (req, res) => {
        const personaId = req.personaId

        try {
        const persona = await prisma.persona.findUnique({
            where: {
            id: personaId,
            },
        })

        if (!persona) {
            return res.status(404).json({ error: "User not found" })
        }

        const ownedprojects = await prisma.proyecto.findMany({
            where: {
            creadorId: personaId,
            },
            include: {
            personas_tiene: true,
            },
        })

        // Check if any owned projects have other members
        const projectsWithOtherMembers = ownedprojects.filter((project) => project.personas_tiene.length > 1)

        if (projectsWithOtherMembers.length > 0) {
            return res.status(400).json({
            error: "Cannot delete account while being creator of projects with other members",
            projectsRequiringAction: projectsWithOtherMembers.map((p) => ({
                id: p.id,
                nombre: p.nombre,
                memberCount: p.personas_tiene.length,
            })),
            message: "You must transfer project ownership or remove other members before deleting your account",
            })
        }

        for (const project of ownedprojects) {
            const chats = await prisma.chat.findMany({
            where: {
                id_proyecto: project.id,
            },
            select: {
                id: true,
            },
            })

            for (const chat of chats) {
            await prisma.leido.deleteMany({
                where: {
                mensaje: {
                    id_chat: chat.id,
                },
                },
            })

            await prisma.mensajes.deleteMany({
                where: {
                id_chat: chat.id,
                },
            })

            await prisma.tiene_pc.deleteMany({
                where: {
                id_chat: chat.id,
                },
            })

            await prisma.tiene_rc.deleteMany({
                where: {
                id_chat: chat.id,
                },
            })
            }

            await prisma.chat.deleteMany({
            where: {
                id_proyecto: project.id,
            },
            })

            await prisma.tareas.deleteMany({
            where: {
                id_proyecto: project.id,
            },
            })

            await prisma.archivos.deleteMany({
            where: {
                id_proyecto: project.id,
            },
            })

            await prisma.invitaciones.deleteMany({
            where: {
                id_proyecto: project.id,
            },
            })

            await prisma.tiene.deleteMany({
            where: {
                id_proyecto: project.id,
            },
            })

            await prisma.proyecto.delete({
            where: {
                id: project.id,
            },
            })
        }

        await prisma.tiene_pc.deleteMany({
            where: {
            id_persona: personaId,
            },
        })

        await prisma.tiene.deleteMany({
            where: {
            id_persona: personaId,
            },
        })

        await prisma.leido.deleteMany({
            where: {
            id_persona: personaId,
            },
        })

        await prisma.mensajes.deleteMany({
            where: {
            id_persona: personaId,
            },
        })

        await prisma.archivos.deleteMany({
            where: {
            id_persona: personaId,
            },
        })

        await prisma.tareas.updateMany({
            where: {
            id_persona: personaId,
            },
            data: {
            id_persona: null,
            },
        })

        await prisma.personalizaciones.deleteMany({
            where: {
            id_persona: personaId,
            },
        })

        await prisma.persona.delete({
            where: {
            id: personaId,
            },
        })

        res.status(200).json({ message: "Account deleted successfully" })
        } catch (error) {
        console.error("Error deleting account:", error)
        res.status(500).json({ error: "Internal Server Error" })
        }
    } 
//
    const transferprojectownership = async (req, res) => {
        const personaId = req.personaId;
        const { proyectoId, newCreadorId } = req.body;

        try {
            if (!proyectoId || !newCreadorId) {
                return res.status(400).json({ error: "missing data" });
            };

            const project = await prisma.proyecto.findUnique({
                where: {
                    id: Number.parseInt(proyectoId, 10),
                },
            });

            if (!project) {
                return res.status(404).json({ error: "Project not found" });
            };

            if (project.creadorId !== personaId) {
                return res.status(403).json({ error: "Only the project creator can transfer ownership" });
            };

            const newCreatorIsMember = await prisma.tiene.findFirst({
                where: {
                    id_persona: Number.parseInt(newCreadorId, 10),
                    id_proyecto: Number.parseInt(proyectoId, 10),
                },
            });

            if (!newCreatorIsMember) {
                return res.status(400).json({ error: "New creator must be a member of the project" });
            };

            await prisma.proyecto.update({
                where: {
                    id: Number.parseInt(proyectoId, 10),
                },
                data: {
                    creadorId: Number.parseInt(newCreadorId, 10),
                },
            });

            res.status(200).json({ message: "Project ownership transferred successfully" });
        } catch (error) {
            console.error("Error transferring project ownership:", error);
            res.status(500).json({ error: "Internal Server Error" });
        };
    };

    return {login, signup, updateuserprofile, deleteaccount, getcurrentuser, transferprojectownership};
};

export default setupsesiones;