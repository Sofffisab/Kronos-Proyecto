import { prisma } from '../prisma/prisma.js';

import { z } from 'zod';
import setupmail from "../mail/mail.js";
const { sendinvitationmail } = setupmail();

const setupproyectos = () => {

  const createProjectSchema = z.object({
    nombre: z.string().min(1).max(100),
    limite: z.string().datetime(),
    descripcion: z.string().max(500).optional(),
  });

  const createproject = async (req, res) => {
    const { nombre, limite, descripcion } = createProjectSchema.parse(req.body);
    const personaId = req.personaId;

    try {
      if (!nombre || !limite) {
        return res.status(400).json({ error: "missing data" });
      };

      const newproject = await prisma.proyecto.create({
        data: {
          nombre: nombre,
          limite: limite,
          descripcion: descripcion || null,
          creadorId: personaId,
        },
      });

      await prisma.tiene.create({
        data: {
          id_persona: personaId,
          id_proyecto: newproject.id,
        },
      });

      res.status(201).json({ message: "project created successfully", project: newproject });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Internal Server Error" });
      throw error;
    };
  };

  const getprojects = async (req, res) => {
    const personaId = req.personaId;

    try {
      const projects = await prisma.proyecto.findMany({
        where: {
          personas_tiene: {
            some: {
              id_persona: personaId,
            },
          },
        },
        include: {
          personas_tiene: {
            include: {
              persona: {
                select: {
                  id: true,
                  usuario: true,
                  nombre: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json(projects);
    } catch (error) {
      console.error("Error getting projects:", error);
      res.status(500).json({ error: "Internal Server Error" });
    };
  };

  const getproject = async (req, res) => {
    const { proyectoId } = req.params;
    const personaId = req.personaId;

    try {
      if (!proyectoId) {
        return res.status(400).json({ error: "missing data" });
      };

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to view this project" });
      };

      const project = await prisma.proyecto.findUnique({
        where: {
          id: Number.parseInt(proyectoId, 10),
        },
        include: {
          personas_tiene: {
            include: {
              persona: {
                select: {
                  id: true,
                  usuario: true,
                  nombre: true,
                },
              },
            },
          },
          tareas: true,
          chats: true,
        },
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      };

      res.status(200).json(project);
    } catch (error) {
      console.error("Error getting project:", error);
      res.status(500).json({ error: "Internal Server Error" });
    };
  };

  const updateproject = async (req, res) => {
    const { proyectoId } = req.params;
    const { nombre, limite, descripcion, fechaFin } = req.body;
    const personaId = req.personaId;

    try {
      if (!proyectoId) {
        return res.status(400).json({ error: "missing data" });
      };

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to update this project" });
      };

      const updateData = {};
      if (nombre) updateData.nombre = nombre;
      if (limite) updateData.limite = limite;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (fechaFin) updateData.fechaFin = new Date(fechaFin);

      const updatedproject = await prisma.proyecto.update({
        where: {
          id: Number.parseInt(proyectoId, 10),
        },
        data: updateData,
      });

      res.status(200).json({ message: "project updated successfully", project: updatedproject });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Internal Server Error" });
    };
  };

  const invitetoproject = async (req, res) => {
    const { proyectoId } = req.params;
    const { mail } = req.body;
    const personaId = req.personaId;

    try {
      if (!proyectoId || !mail) {
        return res.status(400).json({ error: "missing data" });
      };

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to invite to this project" });
      };

      const project = await prisma.proyecto.findUnique({
        where: {
          id: Number.parseInt(proyectoId, 10),
        },
        select: {
          nombre: true,
        },
      });

      
      let codigo;
      let codigoExists = true;

      while (codigoExists) {
        codigo = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const existing = await prisma.invitaciones.findUnique({
          where: { codigo: codigo },
        });
        codigoExists = !!existing;
      };

      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

      const invitation = await prisma.invitaciones.create({
        data: {
          id_proyecto: Number.parseInt(proyectoId, 10),
          mail: mail,
          codigo: codigo,
          estado: "pending",
          fechaExpiracion: fechaExpiracion,
        },
      });

      const mailresult = await sendinvitationmail(mail, codigo, project.nombre);

      if (!mailresult.success) {
        console.error("Failed to send invitation mail:", mailresult.error);
      };

      res.status(201).json({ message: "invitation created successfully", invitation: invitation });
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ error: "Internal Server Error" });
    };
  };

  const joinproject = async (req, res) => {
    const { codigo } = req.body;
    const personaId = req.personaId;

    try {
      if (!codigo) {
        return res.status(400).json({ error: "missing data" });
      };

      const invitation = await prisma.invitaciones.findUnique({
        where: {
          codigo: codigo,
        },
      });

      if (!invitation) {
        return res.status(404).json({ error: "invitation not found" });
      };

      if (invitation.estado !== "pending") {
        return res.status(400).json({ error: "invitation already used" });
      };

      if (new Date() > invitation.fechaExpiracion) {
        return res.status(400).json({ error: "invitation expired" });
      };

      const persona = await prisma.persona.findUnique({
        where: {
          id: personaId,
        },
      });

      if (persona.mail !== invitation.mail) {
        return res.status(403).json({ error: "invitation not for this user" });
      };

      const alreadymember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: invitation.id_proyecto,
        },
      });

      if (alreadymember) {
        return res.status(400).json({ error: "already a member of this project" });
      };

      await prisma.tiene.create({
        data: {
          id_persona: personaId,
          id_proyecto: invitation.id_proyecto,
        },
      });

      const projectChats = await prisma.chat.findMany({
        where: {
          id_proyecto: invitation.id_proyecto,
        },
        select: {
          id: true,
        },
      });

      if (projectChats.length > 0) {
        await prisma.tiene_pc.createMany({
          data: projectChats.map((chat) => ({
            id_persona: personaId,
            id_chat: chat.id,
          })),
        });
      };

      await prisma.invitaciones.update({
        where: {
          codigo: codigo,
        },
        data: {
          estado: "accepted",
        },
      });

      res.status(200).json({ message: "joined project successfully" });
    } catch (error) {
      console.error("Error joining project:", error);
      res.status(500).json({ error: "Internal Server Error" });
    };
  };

  return { createproject, getprojects, getproject, updateproject, invitetoproject, joinproject };
};

export default setupproyectos;