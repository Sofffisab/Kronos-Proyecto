// EN TODO EL ARCHIVO FALTA AGREGAR LOS ;
import { prisma } from "../prisma/prisma.js";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const setupia = () => {
  // ============================================================================
  // FUNCIONES PARA MIRKIN - ANÁLISIS DE PÁGINAS WEB
  // ============================================================================

  const save = async (req, res) => {
    const { name_archivo, archivo_codigo_pagina, lenguaje, foto_pagina_jpg, tema } = req.body;
    const personaId = req.personaId;

    try {
      if (!name_archivo || !archivo_codigo_pagina || !lenguaje || !foto_pagina_jpg || !tema) {
        return res.status(400).json({ error: "missing data" });
      }

      const fotoBuffer = Buffer.from(foto_pagina_jpg, "base64");

      const nuevapagina = await prisma.ia_paginas.create({
        data: {
          name_archivo: name_archivo,
          archivo_codigo_pagina: archivo_codigo_pagina,
          lenguaje: lenguaje,
          foto_pagina_jpg: fotoBuffer,
          tema: tema,
        },
      });

      res.status(201).json({ message: "page saved successfully", pagina: nuevapagina });
    } catch (error) {
      console.error("Error saving page:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  /*
    Funcionalidad: Guardar página analizada

    NECESITA UN FOREACH
    falta poder subir mas de un archivo de codigo
    que por cada archivo de codigo sea necesario un name_archivo, archivo_codigo_pagina y language
    que cada pagina pueda tener solo una foto pagina compartida (en cada fila con mismo id se coloca la misma)
    que todos los archivos de una misma pagina se guarden con el mismo id
  */

  const lookfor = async (req, res) => {
    const { paginaId } = req.params;
    const personaId = req.personaId;

    try {
      if (!paginaId) {
        return res.status(400).json({ error: "missing data" });
      }

      const paginas = await prisma.ia_paginas.findMany({
        where: {
          id: Number.parseInt(paginaId, 10),
        },
      });

      if (!paginas || paginas.length === 0) {
        return res.status(404).json({ error: "page not found" });
      }

      const paginasagrupadas = paginas.map((pagina) => ({
        name_archivo: pagina.name_archivo,
        archivo_codigo_pagina: pagina.archivo_codigo_pagina,
        lenguaje: pagina.lenguaje,
      }));

      res.status(200).json(paginasagrupadas);
    } catch (error) {
      console.error("Error finding page:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  /*
    Funcionalidad: Buscar todas las páginas con el mismo ID y agruparlas

    Esto agarra de la base de datos la info como si YA FUERA un array
    necesito que HAGA un array de TODAS las filas DISTINTAS en la db con mismo id_pagina
  */

  const saveresponse = async (req, res) => {
    const { respuesta_ia } = req.params;
    const personaId = req.personaId;

    try {
      if (!respuesta_ia) {
        return res.status(400).json({ error: "missing data" });
      }

      const respuestaJSON = JSON.stringify(respuesta_ia);
      res.status(200).json({ message: "IA response saved successfully", pagina: paginaactualizada });
      respuestaJSON;
    } catch (error) {
      console.error("Error saving IA response:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  /*
    Funcionalidad: Guardar respuesta de la IA que analiza
  */

  const sendToPython = async (req, res) => {
    const { paginaId } = req.params;
    const personaId = req.personaId;

    try {
      if (!paginaId) {
        return res.status(400).json({ error: "missing data" });
      }

      // 1. Obtener todas las filas con el mismo paginaId
      const paginas = await prisma.ia_paginas.findMany({
        where: {
          id: Number.parseInt(paginaId, 10),
        },
      });

      if (!paginas || paginas.length === 0) {
        return res.status(404).json({ error: "page not found" });
      }

      // 2. Construir language_map y codigo_json
      const language_map = {};
      const codigo_json = [];

      paginas.forEach((pagina) => {
        language_map[pagina.name_archivo] = pagina.lenguaje;
        codigo_json.push({
          name: pagina.name_archivo,
          content: pagina.archivo_codigo_pagina,
        });
      });

      // 3. Obtener la foto (es la misma para todas las filas con mismo id)
      const foto_pagina_jpg = paginas[0].foto_pagina_jpg.toString("base64");
      const tema = paginas[0].tema;

      // 4. Preparar datos para Python
      const datosParaPython = {
        language_map,
        codigo_json,
        image_base64: foto_pagina_jpg,
        theme: tema,
        paginaId: Number.parseInt(paginaId, 10),
      };

      // 5. Ruta al script de Python
      const pythonScript = join(__dirname, "../../IA/Gemini.py");

      // 6. Ejecutar Python usando spawn (mejor que exec para pasar datos por stdin)
      console.log(`Ejecutando Python con paginaId: ${paginaId}`);

      const pythonProcess = spawn("python", [pythonScript]);

      let stdoutData = "";
      let stderrData = "";

      // 7. Enviar datos JSON a Python por stdin
      pythonProcess.stdin.write(JSON.stringify(datosParaPython));
      pythonProcess.stdin.end();

      // 8. Capturar stdout (resultado de Python)
      pythonProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      // 9. Capturar stderr (errores de Python)
      pythonProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
        console.error("Python stderr:", data.toString());
      });

      // 10. Manejar cierre del proceso Python
      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error("stderr:", stderrData);
          return res.status(500).json({
            error: "Error processing with IA",
            details: stderrData || `Process exited with code ${code}`,
          });
        }

        // 11. Parsear y validar resultado
        try {
          const resultado = JSON.parse(stdoutData);

          if (!resultado.success) {
            return res.status(500).json({
              error: "IA processing failed",
              details: resultado.error,
            });
          }

          // 12. Enviar respuesta exitosa
          res.status(200).json({
            message: "IA processing completed successfully",
            resultado: {
              paginaId: resultado.paginaId,
              tabla_analisis: resultado.tabla_analisis,
              codigo_mejorado: resultado.codigo_mejorado,
              referencia_diseno: resultado.referencia_diseno,
            },
          });
        } catch (parseError) {
          console.error("Error parseando resultado de Python:", parseError);
          console.error("stdout:", stdoutData);
          return res.status(500).json({
            error: "Error parsing IA response",
            details: parseError.message,
            raw_output: stdoutData.substring(0, 500),
          });
        }
      });

      // 13. Manejar errores del proceso
      pythonProcess.on("error", (error) => {
        console.error("Error spawning Python process:", error);
        res.status(500).json({
          error: "Failed to start Python process",
          details: error.message,
        });
      });
    } catch (error) {
      console.error("Error sending to Python:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  };
  /*
    Funcionalidad: Enviar datos a Python para análisis con IA (usando stdin/stdout)
    
    Flujo:
    1. Busca todas las filas con el mismo paginaId
    2. Construye language_map y codigo_json
    3. Prepara datos en formato JSON
    4. Usa spawn() para ejecutar Python
    5. Envía datos por stdin
    6. Recibe resultado por stdout
    7. Parsea y valida resultado
    8. Devuelve resultado al frontend
    
    Ventajas sobre archivos temporales:
    - No hay I/O de disco (más rápido)
    - No hay que limpiar archivos
    - Más seguro (datos no quedan en disco)
    - Mejor manejo de errores en tiempo real
  */

/*       - July -

AGARRAR: Horario laboral(personas), limite de tareas(tareas), importancia (tareas), orden (tareas), 
redistribuir informacion
preguntar si quiere agregar a calendario
subir a calendario
*/

  const getdata = async (req, res) => {
    const { proyectoId } = req.params
    const {horario_inicio, horario_fin} = req.params
    const {limite, importancia, orden} = req.params
    const personaId = req.personaId

    try {
      if (!horario_inicio || !horario_fin ) {
        return res.status(400).json({ error: "missing data" })
      }

      const ismember = await prisma.tiene.findMany({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      })

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to access this project" })
      }

      const persona = await prisma.persona.findUnique({
        where: {
          id: personaId,
        },
        select: {
          horario_inicio: true,
          horario_fin: true,
        },
      })

      const tareas = await prisma.tareas.findMany({
        where: {
          id_proyecto: Number.parseInt(proyectoId, 10),
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
      })

      const datosparaia = {
        horario_inicio: persona.horario_inicio,
        horario_fin: persona.horario_fin,
        tareas: tareas,
      }

      res.status(200).json(datosparaia)
    } catch (error) {
      console.error("Error getting data for July:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
/*
  Funcionalidad: Obtener datos para organizar horarios

  Hay que hacer que traiga todas las tablas y valores
*/

  const updatetime = async (req, res) => {
    const { proyectoId } = req.params
    const { tareas_actualizadas } = req.body
    const personaId = req.personaId

    try {
      if (!proyectoId || !tareas_actualizadas || !Array.isArray(tareas_actualizadas)) {
        return res.status(400).json({ error: "missing data" })
      }

      const ismember = await prisma.tiene.findFirst({
        where: {
          id_persona: personaId,
          id_proyecto: Number.parseInt(proyectoId, 10),
        },
      })

      if (!ismember) {
        return res.status(403).json({ error: "You don't have permission to update this project" })
      }

      const actualizaciones = tareas_actualizadas.map(async (tarea) => {
        const updateData = {}
        if (tarea.importancia !== undefined) updateData.importancia = tarea.importancia
        if (tarea.orden !== undefined) updateData.orden = tarea.orden

        return prisma.tareas.update({
          where: {
            id: tarea.id,
          },
          data: updateData,
        })
      })

      await Promise.all(actualizaciones)

      res.status(200).json({ message: "schedule updated successfully" })
    } catch (error) {
      console.error("Error updating schedule:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
/*
Funcionalidad: Actualizar cronograma sugerido 

Falta cambiar todo (el metodo esta bien, falta la info especifica que necesita)
*/

  return { save, lookfor, saveresponse, getdata, updatetime }
}

export default setupia
