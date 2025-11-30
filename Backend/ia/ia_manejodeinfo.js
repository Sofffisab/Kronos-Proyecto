import { prisma } from "../prisma/prisma.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { spawn } from "child_process";
import setupcalendario from "../calendario/calendario.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// FUNCIÓN REUTILIZABLE PARA EJECUTAR SCRIPTS PYTHON
// ============================================================================

const executePythonScript = (scriptPath, datosParaPython, options = {}) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [scriptPath], {
      timeout: options.timeout || 600000, // 10 minutos
      maxBuffer: 10 * 1024 * 1024, // 10MB
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
      },
    });

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdin.write(JSON.stringify(datosParaPython));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
      console.error("[Python stderr]:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        // Si hay stderr, intenta parsearlo como JSON de error
        const errorMessage = stderrData || stdoutData;
        try {
          const parsed = JSON.parse(errorMessage);
          reject(parsed);
        } catch {
          reject({
            error: "Error processing with IA",
            details: errorMessage.substring(0, 500) || `Process exited with code ${code}`,
            code: code,
          });
        }
      } else {
        try {
          const parsed = JSON.parse(stdoutData);
          resolve(parsed);
        } catch (parseError) {
          reject({
            error: "Error parsing IA response",
            details: parseError.message,
            raw_output: stdoutData.substring(0, 500),
          });
        }
      }
    });

    pythonProcess.on("error", (error) => {
      reject({
        error: "Error spawning Python process",
        details: error.message,
      });
    });
  });
};

const setupia = () => {
  // ============================================================================
  // FUNCIONES PARA MIRKIN - ANÁLISIS DE PÁGINAS WEB
  // ============================================================================


  const save = async (req, res) => {
    const { archivos, foto_pagina_jpg, tema } = req.body;
    const personaId = req.personaId;

    try {
      if (!archivos || !Array.isArray(archivos) || archivos.length === 0 || !foto_pagina_jpg || !tema) {
        return res.status(400).json({ error: "Missing required fields: archivos, foto_pagina_jpg, tema" });
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

      const lastPage = await prisma.ia_paginas.findFirst({
        orderBy: { pagina_id: "desc" },
        select: { pagina_id: true },
      })
      const nextPaginaId = lastPage ? lastPage.pagina_id + 1 : 1

      const nuevapagina = await prisma.ia_paginas.create({
        data: {
          id_persona: personaId,
          pagina_id: nextPaginaId,
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
    const paginaIdNumber = Number.parseInt(paginaId, 10);

    const persistIaStatus = async (payload) => {
      try {
        await prisma.ia_paginas.updateMany({
          where: {
            pagina_id: paginaIdNumber,
            id_persona: personaId,
          },
          data: {
            respuesta_ia: JSON.stringify(payload),
          },
        });
      } catch (persistError) {
        console.error("[MIRKIN] Error updating IA status:", persistError);
      }
    };

    try {
      if (!paginaId) {
        return res.status(400).json({ error: "missing data: paginaId" });
      }

      const paginas = await prisma.ia_paginas.findMany({
        where: {
          pagina_id: paginaIdNumber,
          id_persona: personaId,
        },
      });

      if (!paginas || paginas.length === 0) {
        return res.status(404).json({ error: "page not found or you don't have permission to access it" });
      };

      const page = paginas[0];
      if (!page.language_map || !page.codigo_json || !page.imagen_jpg || !page.tema) {
        return res.status(400).json({
          error: "page data incomplete",
          details: "Missing required fields in page data",
        });
      };

      await persistIaStatus({
        status: "standby",
        started_at: new Date().toISOString(),
      });

      // Convert image to base64 string
      let imageBase64;
      try {
        
        const imageBuffer = Buffer.from(page.imagen_jpg);
        imageBase64 = imageBuffer.toString("base64");
        console.log(`[MIRKIN] Image converted to base64, length: ${imageBase64.length} bytes`);
      } catch (conversionError) {
        console.error("[MIRKIN] Error converting image:", conversionError);
        await persistIaStatus({
          status: "failed",
          error: "Error processing image data",
          details: conversionError.message,
          completed_at: new Date().toISOString(),
        });
        return res.status(500).json({
          error: "Error processing image data",
          details: conversionError.message,
        });
      }

      const datosParaPython = {
        language_map: page.language_map,
        codigo_json: page.codigo_json,
        image_base64: imageBase64,
        theme: page.tema,
        paginaId: Number.parseInt(paginaId, 10),
      };

      const pythonScript = join(__dirname, "../../IA/IAMIRKIN.py");

      console.log(`[MIRKIN] Iniciando procesamiento para paginaId: ${paginaId}`);

      const resultado = await executePythonScript(pythonScript, datosParaPython, {
        timeout: 600000, // 10 minutos
      });

      if (!resultado.success) {
        await persistIaStatus({
          status: "failed",
          error: resultado.error || "IA processing failed",
          details: resultado.details,
          completed_at: new Date().toISOString(),
        });
        return res.status(500).json({
          error: "IA processing failed",
          details: resultado.error,
          retry: true,
        });
      };

      const successPayload = {
        status: "completed",
        paginaId: resultado.paginaId || paginaIdNumber,
        tabla_analisis: resultado.tabla_analisis,
        codigo_mejorado: resultado.codigo_mejorado,
        referencia_diseno: resultado.referencia_diseno,
        completed_at: new Date().toISOString(),
      };

      await persistIaStatus(successPayload);

      res.status(200).json({
        message: "IA processing completed successfully",
        resultado: successPayload,
      });
    } catch (error) {
      console.error("Error sending to Python:", error);
      await persistIaStatus({
        status: "failed",
        error: error.error || "Internal Server Error",
        details: error.details || error.message,
        completed_at: new Date().toISOString(),
      });
      res.status(500).json({
        error: error.error || "Internal Server Error",
        details: error.details || error.message,
        retry: error.retry || false,
      });
    };
  };

  const fetchPages = async (req, res) => {
    const personaId = req.personaId;

    try {
      const paginas = await prisma.ia_paginas.findMany({
        where: {
          id_persona: personaId,
        },
        select: {
          id: true,
          pagina_id: true,
          tema: true,
          respuesta_ia: true,
        },
        orderBy: {
          pagina_id: 'desc',
        },
      });

      res.status(200).json({
        message: "pages fetched successfully",
        paginas: paginas,
      });
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  };

  const fetchPageById = async (req, res) => {
    const { paginaId } = req.params;
    const personaId = req.personaId;

    try {
      if (!paginaId) {
        return res.status(400).json({ error: "missing data: paginaId" });
      }

      const pagina = await prisma.ia_paginas.findFirst({
        where: {
          pagina_id: Number.parseInt(paginaId, 10),
          id_persona: personaId,
        },
        select: {
          id: true,
          pagina_id: true,
          tema: true,
          language_map: true,
          codigo_json: true,
          imagen_jpg: true,
          respuesta_ia: true,
        },
      });

      if (!pagina) {
        return res.status(404).json({ error: "page not found or you don't have permission to access it" });
      }

      
     

      res.status(200).json({
        message: "page fetched successfully",
        pagina: {
          id: pagina.id,
          pagina_id: pagina.pagina_id,
          tema: pagina.tema,
          language_map: pagina.language_map,
          codigo_json: pagina.codigo_json,
          imagen_jpg: `data:image/jpeg;base64,${Buffer.from(pagina.imagen_jpg).toString('base64')}`,
          respuesta_ia: pagina.respuesta_ia,
        },
      });
    } catch (error) {
      console.error("Error fetching page by id:", error);
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  };

  // ============================================================================
  // FUNCIONES PARA JULY - ORGANIZACIÓN DE HORARIOS Y TAREAS
  // ============================================================================

  const sendToPythonToo = async (req, res) => {
    const { proyectoId } = req.params;
    const personaId = req.personaId;

    try {
      const proyectoIdNum = Number.parseInt(proyectoId, 10);

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: proyectoIdNum,
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to access this project" });
      }
      
      const persona = await prisma.persona.findUnique({
        where: { id: personaId },
        select: {
          horario_inicio: true,
          horario_fin: true,
          googleRefreshToken: true,
        },
      });

      if (!persona) {
        return res.status(404).json({ error: "User not found" });
      }

      const tareas = await prisma.tareas.findMany({
        where: {
          id_proyecto: proyectoIdNum,
          estado: { not: "done" },
        },
        select: {
          id: true,
          nombre: true,
          limite: true,
          importancia: true,
          duracion: true,
          descripcion: true,
        },
        orderBy: {
          limite: "asc",
        },
      });

      if (!tareas || tareas.length === 0) {
        return res.status(200).json({
          message: "No pending tasks to organize",
          plan: [],
        });
      }

      const datosParaPython = {
        tareas: tareas.map(t => ({
          id: t.id,
          nombre: t.nombre,
          descripcion: t.descripcion || "",
          fecha_limite: t.limite.toISOString().split('T')[0],
          importancia: t.importancia || "media",
          duracion: t.duracion || 60,
        })),
        horario_inicio: persona.horario_inicio ? persona.horario_inicio.toISOString() : null,
        horario_fin: persona.horario_fin ? persona.horario_fin.toISOString() : null,
        proyectoId: proyectoIdNum,
        personaId: personaId,
      };

      const pythonScript = join(__dirname, "../../IA JULI/ChatGPT.py");
      console.log(`Starting processing for project: ${proyectoId}`);

      // Ejecutar script Python usando la función reutilizable
      const resultado = await executePythonScript(pythonScript, datosParaPython, {
        timeout: 600000, // 10 minutos
      });

      if (!resultado.success && !resultado.plan) {
        return res.status(500).json({
          error: "IA processing failed",
          details: resultado.error || resultado.details,
          retry: true,
        });
      };

      const successPayload = {
        status: "completed",
        proyectoId: proyectoIdNum,
        plan: resultado.plan || resultado,
        completed_at: new Date().toISOString(),
      };

      res.status(200).json({
        message: "Schedule organized successfully",
        plan: resultado.plan || resultado,
        proyectoId: proyectoIdNum,
      });

    } catch (error) {
      console.error("Error processing schedule:", error);
      res.status(500).json({
        error: error.error || "Internal Server Error",
        details: error.details || error.message,
        retry: true,
      });
    }
  };

  const updateSchedule = async (req, res) => {
    const { plan, confirmado } = req.body;
    const { proyectoId } = req.params;
    const personaId = req.personaId;

    try {
      if (confirmado !== true) {
        return res.status(400).json({
          error: "User confirmation required",
          message: "El usuario debe confirmar los cambios antes de aplicarlos"
        });
      };

      if (!proyectoId || !plan || !Array.isArray(plan)) {
        return res.status(400).json({ error: "Missing data: proyectoId or plan" });
      }

      const proyectoIdNum = Number.parseInt(proyectoId, 10);

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: proyectoIdNum,
        },
      });

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to update this project" });
      };

      const persona = await prisma.persona.findUnique({
        where: { id: personaId },
        select: { googleRefreshToken: true },
      });

      if (persona && persona.googleRefreshToken) {
        const { lookfortoken } = setupcalendario();
        
        try {
          const calendar = await lookfortoken(persona.googleRefreshToken);

          for (const item of plan) {
            if (item.planificacion && Array.isArray(item.planificacion)) {
              for (const dia of item.planificacion) {
                const fecha = new Date(dia.dia);
                
                let duracionMinutos = 60; // default
                const tiempoStr = dia.tiempo_asignado || "";
                
                if (tiempoStr.includes("30 minutos")) {
                  duracionMinutos = 30;
                } else if (tiempoStr.includes("hora y media")) {
                  duracionMinutos = 90;
                } else if (tiempoStr.includes("2 horas y media")) {
                  duracionMinutos = 150;
                } else if (tiempoStr.includes("2 horas")) {
                  duracionMinutos = 120;
                } else if (tiempoStr.includes("3 horas")) {
                  duracionMinutos = 180;
                } else if (tiempoStr.includes("4 horas")) {
                  duracionMinutos = 240;
                } else if (tiempoStr.match(/(\d+)\s*hora/)) {
                  const horas = parseInt(tiempoStr.match(/(\d+)\s*hora/)[1]);
                  duracionMinutos = horas * 60;
                }

                const fechaFin = new Date(fecha.getTime() + duracionMinutos * 60000);

                const evento = {
                  summary: item.nombre,
                  description: `Tarea del proyecto - Prioridad: ${item.prioridad}`,
                  start: {
                    dateTime: fecha.toISOString(),
                    timeZone: "America/Argentina/Buenos_Aires",
                  },
                  end: {
                    dateTime: fechaFin.toISOString(),
                    timeZone: "America/Argentina/Buenos_Aires",
                  },
                };

                await calendar.events.insert({
                  calendarId: 'primary',
                  resource: evento,
                });

                console.log(`Event created for task: ${item.nombre} on ${dia.dia}`);
              }
            }
          }

          console.log(`All events created in Google Calendar for project ${proyectoId}`);
        } catch (calendarError) {
          console.error("Error creating calendar events:", calendarError);
        }
      }

      const actualizaciones = plan.map(async (tarea) => {
        const updateData = {};
        
        if (tarea.importancia !== undefined) {
          updateData.importancia = tarea.importancia;
        }
        
        if (tarea.orden !== undefined) {
          updateData.orden = tarea.orden;
        }

        if (tarea.planificacion && tarea.planificacion.length > 0) {
          const ultimoDia = tarea.planificacion[tarea.planificacion.length - 1];
          if (ultimoDia.dia) {
            updateData.limite = new Date(ultimoDia.dia);
          }
        }

        if (Object.keys(updateData).length > 0 && tarea.id) {
          return prisma.tareas.update({
            where: { id: tarea.id },
            data: updateData,
          });
        }
      });

      await Promise.all(actualizaciones.filter(Boolean));

      res.status(200).json({ 
        message: "Schedule updated and events created successfully",
        eventsCreated: !!persona?.googleRefreshToken,
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

  return { save, sendToPython, fetchPages, fetchPageById, sendToPythonToo, updateSchedule };
};

export default setupia;