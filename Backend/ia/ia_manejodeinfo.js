import { prisma } from "../prisma/prisma.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { spawn } from 'child_process';

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
      // 1. Validar datos obligatorios
      if (!pagina_id || !archivos || !Array.isArray(archivos) || archivos.length === 0 || !foto_pagina_jpg || !tema) {
        return res.status(400).json({ error: "missing data" });
      }

      // 2. Construir language_map (objeto con nombre_archivo: lenguaje)
      const language_map = {};
      archivos.forEach((archivo) => {
        if (!archivo.nombre || !archivo.lenguaje) {
          throw new Error("Each archivo must have 'nombre' and 'lenguaje'");
        }
        language_map[archivo.nombre] = archivo.lenguaje;
      });

      // 3. Construir codigo_json (array de objetos con name y content)
      const codigo_json = archivos.map((archivo) => {
        if (!archivo.codigo) {
          throw new Error("Each archivo must have 'codigo'");
        }
        return {
          name: archivo.nombre,
          content: archivo.codigo,
        };
      });

      // 4. Convertir imagen base64 a Buffer
      const fotoBuffer = Buffer.from(foto_pagina_jpg, "base64");

      // 5. Guardar en la base de datos
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
          archivos_guardados: archivos.length
        }
      });

    } catch (error) {
      console.error("Error saving page:", error);
      res.status(500).json({ 
        error: "Internal Server Error", 
        details: error.message,
        retry: true,
      });
    };
  };
  const lookfor = () =>{}
  const getdata = () =>{}
  const updatetime = () =>{}
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
          pagina_id: Number.parseInt(paginaId, 10),
        },
      });

      if (!paginas || paginas.length === 0) {
        return res.status(404).json({ error: "page not found" });
      }

      // 2. Construir language_map y codigo_json
      const language_map = paginas[0].language_map;
      const codigo_json = paginas[0].codigo_json;
      const foto_pagina_jpg = paginas[0].imagen_jpg.toString("base64");

      // 3. Obtener la foto (es la misma para todas las filas con mismo id)
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

  const saveresponse = async (req, res) => {
    const { paginaId, tabla_analisis, codigo_mejorado, referencia_diseno } = req.body;
    const personaId = req.personaId;

    try {
      // 1. Validar datos obligatorios
      if (!paginaId || !tabla_analisis || !codigo_mejorado || !referencia_diseno) {
        return res.status(400).json({ error: "missing data" });
      }

      // 2. Construir objeto JSON con la respuesta completa
      const respuesta_ia_json = {
        tabla_analisis: tabla_analisis,
        codigo_mejorado: codigo_mejorado,
        referencia_diseno: referencia_diseno,
        fecha_procesamiento: new Date().toISOString(),
      };

      // 3. Convertir a string JSON para guardar en respuesta_ia (String?)
      const respuesta_ia_string = JSON.stringify(respuesta_ia_json);

      // 4. Actualizar el registro existente
      const paginaActualizada = await prisma.ia_paginas.updateMany({
        where: {
          pagina_id: Number.parseInt(paginaId, 10),
        },
        data: {
          respuesta_ia: respuesta_ia_string,
        },
      });

      // 5. Verificar que se actualizó
      if (paginaActualizada.count === 0) {
        return res.status(404).json({ error: "page not found" });
      }

      res.status(200).json({ 
        message: "response saved successfully", 
        paginaId: paginaId,
        registros_actualizados: paginaActualizada.count
      });

    } catch (error) {
      console.error("Error saving IA response:", error);
      res.status(500).json({ 
        error: "Internal Server Error", 
        details: error.message,
        retry: true 
      });
    };
  };

  return { save, sendToPython, saveresponse, lookfor, updatetime, getdata }
}

export default setupia
