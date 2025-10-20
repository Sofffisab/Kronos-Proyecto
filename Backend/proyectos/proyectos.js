import pkg from "@prisma/client"
const { PrismaClient } = pkg
import crypto from "crypto"
const prisma = new PrismaClient()

const setupproyectos = () => {

  const createproject = async (req, res) => {
    const { nombre, descripcion, fechaInicio, fechaFin } = req.body
    const personaId = req.personaId

    try {
      if (!nombre) {
        return res.status(400).json({ error: "missing data" })
      }

      const proyecto = await prisma.proyecto.create({
        data: {
          nombre: nombre,
          descripcion: descripcion || "",
          fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
          fechaFin: fechaFin ? new Date(fechaFin) : null,
          creadorId: personaId,
        },
      })

      await prisma.tiene.create({
        data: {
          id_persona: personaId,
          id_proyecto: proyecto.id,
        },
      })

      res.status(201).json({ message: "project created successfully", proyecto })
    } catch (error) {
      console.error("Error creating project:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  const getprojects = async (req, res) => {
    const personaId = req.personaId

    try {
      const proyectos = await prisma.proyecto.findMany({
        where: {
          personas_tiene: {
            some: { id_persona: personaId },
          },
        },
        include: {
          personas_tiene: {
            include: {
              persona: {
                select: {
                  id: true,
                  nombre: true,
                  usuario: true,
                  mail: true,
                },
              },
            },
          },
        },
      })

      res.status(200).json(proyectos)
    } catch (error) {
      console.error("Error getting projects:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  const getproject = async (req, res) => {
    const { proyectoId } = req.params
    const personaId = req.personaId

    try {
      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      })

      if (!ismember) {
        return res.status(403).json({ error: "No permission to view this project" })
      }

      const proyecto = await prisma.proyecto.findUnique({
        where: { id: Number.parseInt(proyectoId, 10) },
        include: {
          personas_tiene: {
            include: {
              persona: {
                select: {
                  id: true,
                  nombre: true,
                  usuario: true,
                  mail: true,
                },
              },
            },
          },
        },
      })

      res.status(200).json(proyecto)
    } catch (error) {
      console.error("Error getting project:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  const updateproject = async (req, res) => {
    const { proyectoId } = req.params
    const { nombre, descripcion, fechaInicio, fechaFin } = req.body
    const personaId = req.personaId

    try {
      const proyecto = await prisma.proyecto.findUnique({
        where: { id: Number.parseInt(proyectoId, 10) },
      })

      if (!proyecto) {
        return res.status(404).json({ error: "Project not found" })
      }

      if (proyecto.creadorId !== personaId) {
        return res.status(403).json({ error: "Only creator can update project" })
      }

      const updated = await prisma.proyecto.update({
        where: { id: Number.parseInt(proyectoId, 10) },
        data: {
          ...(nombre && { nombre }),
          ...(descripcion !== undefined && { descripcion }),
          ...(fechaInicio && { fechaInicio: new Date(fechaInicio) }),
          ...(fechaFin !== undefined && { fechaFin: fechaFin ? new Date(fechaFin) : null }),
        },
      })

      res.status(200).json({ message: "project updated successfully", proyecto: updated })
    } catch (error) {
      console.error("Error updating project:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  const invitetoproject = async (req, res) => {
    const { proyectoId } = req.params
    const { mail } = req.body
    const personaId = req.personaId

    try {
      if (!mail) {
        return res.status(400).json({ error: "missing data" })
      }

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      })

      if (!ismember) {
        return res.status(403).json({ error: "No permission to invite to this project" })
      }

      const personaexiste = await prisma.persona.findUnique({
        where: { mail: mail },
      })

      if (personaexiste) {
        const yamiembro = await prisma.tiene.findFirst({
          where: {
            id_persona: personaexiste.id,
            id_proyecto: Number.parseInt(proyectoId, 10),
          },
        })

        if (yamiembro) {
          return res.status(400).json({ error: "Person already in project" })
        }
      }

      const invitacionexiste = await prisma.invitaciones.findFirst({
        where: {
          id_proyecto: Number.parseInt(proyectoId, 10),
          mail: mail,
          estado: "pendiente",
        },
      })

      if (invitacionexiste) {
        return res.status(400).json({
          error: "Invitation already sent",
          codigo: invitacionexiste.codigo,
        })
      }

      let codigo = crypto.randomBytes(4).toString("hex").toUpperCase()
      let codigoexiste = await prisma.invitaciones.findFirst({
        where: { codigo: codigo, estado: "pendiente" },
      })

      while (codigoexiste) {
        codigo = crypto.randomBytes(4).toString("hex").toUpperCase()
        codigoexiste = await prisma.invitaciones.findFirst({
          where: { codigo: codigo, estado: "pendiente" },
        })
      }

      const fechaexpiracion = new Date()
      fechaexpiracion.setDate(fechaexpiracion.getDate() + 7)

      const invitacion = await prisma.invitaciones.create({
        data: {
          id_proyecto: Number.parseInt(proyectoId, 10),
          mail: mail,
          codigo: codigo,
          estado: "pendiente",
          fechaExpiracion: fechaexpiracion,
        },
      })

      res.status(201).json({
        message: "invitation sent successfully",
        codigo: invitacion.codigo,
        fechaExpiracion: invitacion.fechaExpiracion,
      })
    } catch (error) {
      console.error("Error sending invitation:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  const joinproject = async (req, res) => {
    const { codigo } = req.body
    const personaId = req.personaId

    try {
      if (!codigo) {
        return res.status(400).json({ error: "missing data" })
      }

      const invitacion = await prisma.invitaciones.findFirst({
        where: {
          codigo: codigo.toUpperCase(),
          estado: "pendiente",
        },
      })

      if (!invitacion) {
        return res.status(404).json({ error: "Invalid or expired code" })
      }

      if (new Date() > invitacion.fechaExpiracion) {
        await prisma.invitaciones.update({
          where: { id: invitacion.id },
          data: { estado: "expirada" },
        })
        return res.status(400).json({ error: "Code expired" })
      }

      const yamiembro = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: invitacion.id_proyecto,
        },
      })

      if (yamiembro) {
        return res.status(400).json({ error: "Already in project" })
      }

      await prisma.tiene.create({
        data: {
          id_persona: personaId,
          id_proyecto: invitacion.id_proyecto,
        },
      })

      await prisma.invitaciones.update({
        where: { id: invitacion.id },
        data: { estado: "aceptada" },
      })

      const proyecto = await prisma.proyecto.findUnique({
        where: { id: invitacion.id_proyecto },
      })

      res.status(200).json({
        message: "joined project successfully",
        proyecto,
      })
    } catch (error) {
      console.error("Error joining project:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  return { createproject, getprojects, getproject, updateproject, invitetoproject, joinproject }
}

export default setupproyectos
