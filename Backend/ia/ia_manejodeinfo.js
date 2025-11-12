import { prisma } from "../prisma/prisma.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { spawn } from "child_process";
import setupcalendario from "../calendario/calendario.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const setupia = () => {
  // ============================================================================
  // FUNCIONES PARA MIRKIN - ANÁLISIS DE PÁGINAS WEB
  // ============================================================================

  const save = async (req, res) => {
    const { pagina_id, archivos, foto_pagina_jpg, tema } = req.body;
    const personaId = req.personaId;

    try {
      if (!pagina_id || !archivos || !Array.isArray(archivos) || archivos.length === 0 || !foto_pagina_jpg || !tema) {
        return res.status(400).json({ error: "missing data" });
      }

      const language_map = {};
      archivos.forEach((archivo) => {
        if (!archivo.nombre || !archivo.lenguaje) {
          throw new Error("Each archivo must have 'nombre' and 'lenguaje'");
        }
        language_map[archivo.nombre] = archivo.lenguaje;
      });

      const codigo_json = archivos.map((archivo) => {
        if (!archivo.codigo) {
          throw new Error("Each archivo must have 'codigo'");
        }
        return {
          name: archivo.nombre,
          content: archivo.codigo,
        };
      });

      const fotoBuffer = Buffer.from(foto_pagina_jpg, "base64");

      const nuevapagina = await prisma.ia_paginas.create({
        data: {
          pagina_id: Number.parseInt(pagina_id, 10),
          language_map: language_map,
          codigo_json: codigo_json,
          imagen_jpg: fotoBuffer,
          tema: tema,
        },
      });

      res.status(201).json({
        message: "page saved successfully",
        pagina: {
          id: nuevapagina.id,
          pagina_id: nuevapagina.pagina_id,
          tema: nuevapagina.tema,
          archivos_guardados: archivos.length,
        },
      });
    } catch (error) {
      console.error("Error saving page:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
        retry: true,
      });
    }
  };

  const sendToPython = async (req, res) => {
    const { paginaId } = req.params;
    const personaId = req.personaId;

    try {
      if (!paginaId) {
        return res.status(400).json({ error: "missing data" });
      }

      const pagina = await prisma.ia_paginas.findFirst({
        where: {
          pagina_id: Number.parseInt(paginaId, 10),
        },
      });

      if (!paginas || paginas.length === 0) {
        return res.status(404).json({ error: "page not found" });
      }

      const language_map = paginas[0].language_map;
      const codigo_json = paginas[0].codigo_json;
      const foto_pagina_jpg = paginas[0].imagen_jpg.toString("base64");
      const tema = paginas[0].tema;
      const datosParaPython = {
        language_map,
        codigo_json,
        image_base64: foto_pagina_jpg,
        theme: tema,
        paginaId: Number.parseInt(paginaId, 10),
      };

      const pythonScript = join(__dirname, "../../IA/Gemini.py");

      console.log(`Ejecutando Python con paginaId: ${paginaId}`);

      const pythonProcess = spawn("python", [pythonScript]);

      let stdoutData = "";
      let stderrData = "";

      pythonProcess.stdin.write(JSON.stringify(datosParaPython));
      pythonProcess.stdin.end();

      const resultado = await new Promise((resolve, reject) => {
        pythonProcess.stdout.on("data", (data) => {
          stdoutData += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
          stderrData += data.toString();
          console.error("Python stderr:", data.toString());
        });

        pythonProcess.on("close", (code) => {
          if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            console.error("stderr:", stderrData);
            reject({
              error: "Error processing with IA",
              details: stderrData || `Process exited with code ${code}`,
            });
          } else {
            try {
              const parsed = JSON.parse(stdoutData);
              resolve(parsed);
            } catch (parseError) {
              console.error("Error parseando resultado de Python:", parseError);
              console.error("stdout:", stdoutData);
              reject({
                error: "Error parsing IA response",
                details: parseError.message,
                raw_output: stdoutData.substring(0, 500),
              });
            }
          }
        });

        pythonProcess.on("error", (error) => {
          console.error("Error spawning Python process:", error);
           return res.status(500).json({
            error: "Error processing with IA",
            details: stderrData || `Process exited with code ${code}`,
          });
        });
      });

      if (!resultado.success) {
        return res.status(500).json({
          error: "IA processing failed",
          details: resultado.error,
          retry: true,
        });
      }

      res.status(200).json({
        message: "IA processing completed successfully",
        resultado: {
          paginaId: resultado.paginaId,
          tabla_analisis: resultado.tabla_analisis,
          codigo_mejorado: resultado.codigo_mejorado,
          referencia_diseno: resultado.referencia_diseno,
        },
      });
    } catch (error) {
      console.error("Error sending to Python:", error);
      res.status(500).json({
        error: error.error || "Internal Server Error",
        details: error.details || error.message,
        retry: true,
      });
    }
  };

  const saveResponse = async (req, res) => {
    const { paginaId, tabla_analisis, codigo_mejorado, referencia_diseno } = req.body;
    const personaId = req.personaId;

    try {
      if (!paginaId || !tabla_analisis || !codigo_mejorado || !referencia_diseno) {
        return res.status(400).json({ error: "missing data" });
      }

      const respuesta_ia_json = {
        tabla_analisis: tabla_analisis,
        codigo_mejorado: codigo_mejorado,
        referencia_diseno: referencia_diseno,
        fecha_procesamiento: new Date().toISOString(),
      };

      const respuesta_ia_string = JSON.stringify(respuesta_ia_json);

      const paginaActualizada = await prisma.ia_paginas.updateMany({
        where: {
          pagina_id: Number.parseInt(paginaId, 10),
        },
        data: {
          respuesta_ia: respuesta_ia_string,
        },
      });

      if (paginaActualizada.count === 0) {
        return res.status(404).json({ error: "page not found" });
      }

      res.status(200).json({
        message: "response saved successfully",
        paginaId: paginaId,
        registros_actualizados: paginaActualizada.count,
      });
    } catch (error) {
      console.error("Error saving IA response:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
        retry: true,
      });
    }
  };

  // ============================================================================
  // FUNCIONES PARA JULY - ORGANIZACIÓN DE HORARIOS Y TAREAS
  // ============================================================================

  const getDataForScheduling = async (req, res) => {
    const { proyectoId } = req.params;
    const personaId = req.personaId;

    try {
      if (!proyectoId) {
        return res.status(400).json({ error: "missing data" });
      }

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to access this project" });
      }

      const persona = await prisma.persona.findUnique({
        where: {
          id: personaId,
        },
        select: {
          horario_inicio: true,
          horario_fin: true,
        },
      });

      const tareas = await prisma.tareas.findMany({
        where: {
          id_proyecto: Number.parseInt(proyectoId, 10),
          estado: {
            in: ["pending", "in-progress"],
          },
        },
        select: {
          id: true,
          nombre: true,
          limite: true,
          importancia: true,
          orden: true,
          estado: true,
        },
        orderBy: {
          limite: "asc",
        },
      });

      res.status(200).json({
        horario_inicio: persona.horario_inicio,
        horario_fin: persona.horario_fin,
        tareas: tareas,
        proyectoId: Number.parseInt(proyectoId, 10),
      });
    } catch (error) {
      console.error("Error getting data for July:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
        retry: true,
      });
    }
  };

  const sendToPythonToo = async (req, res) => {
    const { proyectoId } = req.params;
    const { horario_inicio, horario_fin, tareas } = req.body;
    const personaId = req.personaId;

    try {
      if (!proyectoId || !tareas || !Array.isArray(tareas) || tareas.length === 0) {
        return res.status(400).json({ error: "missing data" });
      }

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to organize this project" });
      }

      const datosParaPython = {
        horario_inicio: horario_inicio,
        horario_fin: horario_fin,
        tareas: tareas,
      };

      const pythonScript = join(__dirname, "../../IA/organizar_tareas.py");

      console.log(`Ejecutando Python para organizar proyecto: ${proyectoId}`);

      const pythonProcess = spawn("python", [pythonScript]);

      let stdoutData = "";
      let stderrData = "";

      pythonProcess.stdin.write(JSON.stringify(datosParaPython));
      pythonProcess.stdin.end();

      const resultado = await new Promise((resolve, reject) => {
        pythonProcess.stdout.on("data", (data) => {
          stdoutData += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
          stderrData += data.toString();
          console.error("Python stderr:", data.toString());
        });

        pythonProcess.on("close", (code) => {
          if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            console.error("stderr:", stderrData);
            reject({
              error: "Error processing schedule with IA",
              details: stderrData || `Process exited with code ${code}`,
            });
          } else {
            try {
              const parsed = JSON.parse(stdoutData);
              resolve(parsed);
            } catch (parseError) {
              console.error("Error parseando resultado de Python:", parseError);
              reject({
                error: "Error parsing IA response",
                details: parseError.message,
                raw_output: stdoutData.substring(0, 500),
              });
            }
          }
        });

        pythonProcess.on("error", (error) => {
          console.error("Error spawning Python process:", error);
          reject({
            error: "Failed to start Python process",
            details: error.message,
          });
        });
      });

      if (!resultado.plan) {
        return res.status(500).json({
          error: "IA scheduling failed",
          details: resultado.error || "No plan returned",
          retry: true,
        });
      }

      res.status(200).json({
        message: "Schedule organized successfully",
        plan: resultado.plan,
        proyectoId: Number.parseInt(proyectoId, 10),
      });
    } catch (error) {
      console.error("Error sending to July Python:", error);
      res.status(500).json({
        error: error.error || "Internal Server Error",
        details: error.details || error.message,
        retry: true,
      });
    }
  };

  const updateSchedule = async (req, res) => {
    const { proyectoId } = req.params;
    const { plan, agregar_a_calendario } = req.body;
    const personaId = req.personaId;

    try {
      if (!proyectoId || !plan || !Array.isArray(plan)) {
        return res.status(400).json({ error: "missing data" });
      }

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to update this project" });
      }

      const actualizaciones = plan.map((tarea, index) => {
        return prisma.tareas.update({
          where: {
            id: tarea.id,
          },
          data: {
            orden: index + 1,
          },
        });
      });

      await Promise.all(actualizaciones);

      let eventosCreados = 0;
      if (agregar_a_calendario === true) {
        const persona = await prisma.persona.findUnique({
          where: { id: personaId },
          select: { googleRefreshToken: true },
        });

        if (persona && persona.googleRefreshToken) {
          const { lookfortoken } = setupcalendario();
          const calendar = await lookfortoken(persona.googleRefreshToken);

          for (const tarea of plan) {
            try {
              if (tarea.dia_recomendado) {
                const fechaRecomendada = new Date(tarea.dia_recomendado);

                await calendar.events.insert({
                  calendarId: "primary",
                  resource: {
                    summary: tarea.nombre,
                    description: `Tarea sugerida por IA - Importancia: ${tarea.importancia || "medium"}`,
                    start: {
                      dateTime: fechaRecomendada.toISOString(),
                      timeZone: "UTC",
                    },
                    end: {
                      dateTime: new Date(fechaRecomendada.getTime() + (tarea.duracion || 60) * 60 * 1000).toISOString(),
                      timeZone: "UTC",
                    },
                  },
                });

                eventosCreados++;
              }
            } catch (calendarError) {
              console.error(`Error creating calendar event for task ${tarea.id}:`, calendarError);
            }
          }
        }
      }

      res.status(200).json({
        message: "Schedule updated successfully",
        tareas_actualizadas: plan.length,
        eventos_creados: eventosCreados,
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
        retry: true,
      });
    }
  };

  return { save, sendToPython, saveResponse, getDataForScheduling, sendToPythonToo, updateSchedule};
};

export default setupia;