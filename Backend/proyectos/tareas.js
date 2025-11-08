import { prisma } from '../prisma/prisma.js';
import setupcalendario from "../calendario/calendario.js";

const setuptareas = () => {
  const { lookfortoken } = setupcalendario();

  const createtarea = async (req, res) => {
    const { nombre, limite, id_persona_responsable, estado, importancia } = req.body;
    const { proyectoId } = req.params;
    const personaId = req.personaId;

    try {
      if (!nombre || !limite || !proyectoId || !estado || !importancia) {
        return res.status(400).json({ error: "missing data" });
      };

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to create tasks in this project" });
      };

      const responsableId = id_persona_responsable || personaId;

      const isresponsablemember = await prisma.tiene.findFirst({
        where: {
          id_persona: responsableId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      });

      if (!isresponsablemember) {
        return res.status(400).json({ error: "responsible person is not a member of this project" });
      };

      const nombre_responsable = await prisma.persona.findUnique({
        where: {id: responsableId},
        select: {nombre: true}
      })
      

      const newtarea = await prisma.tareas.create({
        data: {
          nombre: nombre,
          estado: estado,
          limite: limite,
          id_proyecto: Number.parseInt(proyectoId, 10),
          id_persona: responsableId,
          nombre_responsable: nombre_responsable.nombre,
          importancia: importancia,
        },
      });

      try {
        const persona = await prisma.persona.findUnique({
          where: { id: responsableId },
          select: { googleRefreshToken: true },
        });

        if (persona && persona.googleRefreshToken) {;
          const calendar = await lookfortoken(persona.googleRefreshToken);
          const limiteDate = new Date(limite);

          const event = await calendar.events.insert({
            calendarId: "primary",
            resource: {
              summary: nombre,
              description: `Task from project`,
              start: {
                dateTime: limiteDate.toISOString(),
                timeZone: "UTC",
              },
              end: {
                dateTime: new Date(limiteDate.getTime() + 60 * 60 * 1000).toISOString(),
                timeZone: "UTC",
              },
            },
          });

          await prisma.tareas.update({
            where: { id: newtarea.id },
            data: { eventId: event.data.id },
          });
        };
      } catch (calendarError) {
        console.error("Error creating calendar event:", calendarError);
      };

      res.status(201).json({ message: "task created successfully", tarea: newtarea });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Internal Server Error" });
    };
  };

  const gettareas = async (req, res) => {
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
        return res.status(403).json({ error: "You don't have permission to view tasks in this project" });
      };

      const tareas = await prisma.tareas.findMany({
        where: {
          id_proyecto: Number.parseInt(proyectoId, 10),
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
        orderBy: {
          id: "asc",
        },
      });

      const tareasconcolor = tareas.map((tarea) => {
        const now = new Date();
        const limiteDate = new Date(tarea.limite);
        let color = "yellow";

        if (tarea.estado === "done") {
          if (now > limiteDate) {
            color = "green";
          } else {
            color = "green";
          };
        } else if (tarea.estado === "in-progress") {
          color = "yellow";
        } else if (tarea.estado === "pending") {
          if (now > limiteDate) {
            color = "black";
          } else {
            color = "red";
          };
        };

        return {
          ...tarea,
          color: color,
        };
      });

      res.status(200).json(tareasconcolor);
    } catch (error) {
      console.error("Error getting tasks:", error);
      res.status(500).json({ error: "Internal Server Error" });
    };
  };

  const updatetarea = async (req, res) => {
    const { tareaId } = req.params;
    const { estado, nombre, limite, } = req.body;
    const personaId = req.personaId;

    try {
      if (!tareaId) {
        return res.status(400).json({ error: "missing data" });
      };

      const tarea = await prisma.tareas.findUnique({
        where: {
          id: Number.parseInt(tareaId, 10),
        },
      });

      if (!tarea) {
        return res.status(404).json({ error: "task not found" });
      };

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: tarea.id_proyecto,
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to update this task" });
      };

      const updateData = {};
      if (estado) updateData.estado = estado;
      if (nombre) updateData.nombre = nombre;
      if (limite) updateData.limite = limite;

      const updatedtarea = await prisma.tareas.update({
        where: {
          id: Number.parseInt(tareaId, 10),
        },
        data: updateData,
      });

      if (tarea.eventId && (nombre || limite)) {
        try {
          const persona = await prisma.persona.findUnique({
            where: { id: tarea.id_persona },
            select: { googleRefreshToken: true },
          });

          if (persona && persona.googleRefreshToken) {
            const calendar = await lookfortoken(persona.googleRefreshToken);
            const limiteDate = new Date(limite || tarea.limite);

            await calendar.events.update({
              calendarId: "primary",
              eventId: tarea.eventId,
              resource: {
                summary: nombre || tarea.nombre,
                start: {
                  dateTime: limiteDate.toISOString(),
                  timeZone: "UTC",
                },
                end: {
                  dateTime: new Date(limiteDate.getTime() + 60 * 60 * 1000).toISOString(),
                  timeZone: "UTC",
                },
              },
            });
          };
        } catch (calendarError) {
          console.error("Error updating calendar event:", calendarError);
        };
      };

      res.status(200).json({ message: "task updated successfully", tarea: updatedtarea });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Internal Server Error" });
    };
  };

  const deletetarea = async (req, res) => {
    const { tareaId } = req.params;
    const personaId = req.personaId;

    try {
      if (!tareaId) {
        return res.status(400).json({ error: "missing data" })
      };

      const tarea = await prisma.tareas.findUnique({
        where: {
          id: Number.parseInt(tareaId, 10),
        },
      });

      if (!tarea) {
        return res.status(404).json({ error: "task not found" })
      };

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: tarea.id_proyecto,
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to delete this task" });
      };

      if (tarea.eventId) {
        try {
          const persona = await prisma.persona.findUnique({
            where: { id: tarea.id_persona },
            select: { googleRefreshToken: true },
          });

          if (persona && persona.googleRefreshToken) {
            const calendar = await lookfortoken(persona.googleRefreshToken);
            await calendar.events.delete({
              calendarId: "primary",
              eventId: tarea.eventId,
            });
          };
        } catch (calendarError) {
          console.error("Error deleting calendar event:", calendarError);
        };
      };

      await prisma.tareas.delete({
        where: {
          id: Number.parseInt(tareaId, 10),
        },
      });

      res.status(204).json();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Internal Server Error" });
    };
  };

  const gettarea = async (req, res) => {
    const { tareaId } = req.params;
    const personaId = req.personaId;

    try {
      if (!tareaId) {
        return res.status(400).json({ error: "missing data" });
      }

      const tarea = await prisma.tareas.findUnique({
        where: {
          id: Number.parseInt(tareaId, 10),
        },
        include: {
          asignado: {
            select: {
              id: true,
              usuario: true,
              nombre: true,
            },
          },
          responsable: {
            select: {
              id: true,
              usuario: true,
              nombre: true,
            },
          },
          proyecto: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });

      if (!tarea) {
        return res.status(404).json({ error: "task not found" });
      }

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: tarea.id_proyecto,
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to view this task" });
      }

      const now = new Date();
      const limiteDate = new Date(tarea.limite);
      let color = "yellow";

      if (tarea.estado === "done") {
        color = "green";
      } else if (tarea.estado === "in-progress") {
        color = "yellow";
      } else if (tarea.estado === "pending") {
        if (now > limiteDate) {
          color = "black";
        } else {
          color = "red";
        }
      }

      res.status(200).json({ ...tarea, color });
    } catch (error) {
      console.error("Error getting task:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  return { createtarea, gettareas, gettarea, updatetarea, deletetarea };
};

export default setuptareas;