// EN TODO EL ARCHIVO FALTA AGREGAR LOS ;
import { prisma } from "../prisma/prisma.js"

const setupia = () => {
//         - Mirkin - 

  const save = async (req, res) => {
    const { name_archivo, archivo_codigo_pagina, lenguaje, foto_pagina_jpg, tema } = req.body
    const personaId = req.personaId

    try {
      if (!name_archivo || !archivo_codigo_pagina || !lenguaje || !foto_pagina_jpg || !tema) {
        return res.status(400).json({ error: "missing data" })
      }

      const fotoBuffer = Buffer.from(foto_pagina_jpg, "base64")

      const nuevapagina = await prisma.ia_paginas.create({
        data: {
          name_archivo: name_archivo,
          archivo_codigo_pagina: archivo_codigo_pagina,
          lenguaje: lenguaje,
          foto_pagina_jpg: fotoBuffer,
          tema: tema,
        },
      })

      res.status(201).json({ message: "page saved successfully", pagina: nuevapagina })
    } catch (error) {
      console.error("Error saving page:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
/*
    Funcionalidad: Guardar página analizada

    NECESITA UN FOREACH
    falta poder subir mas de un archivo de codigo
    que por cada archivo de codigo sea necesario un name_archivo, archivo_codigo_pagina y language
    que cada pagina pueda tener solo una foto pagina compartida (en cada fila con mismo id se coloca la misma)
    que todos los archivos de una misma pagina se guarden con el mismo id
*/

  const lookfor = async (req, res) => {
    const { paginaId } = req.params
    const personaId = req.personaId

    try {
      if (!paginaId) {
        return res.status(400).json({ error: "missing data" })
      }

      const paginas = await prisma.ia_paginas.findMany({
        where: {
          id: Number.parseInt(paginaId, 10),
        },
      })

      if (!paginas || paginas.length === 0) {
        return res.status(404).json({ error: "page not found" })
      }

      const paginasagrupadas = paginas.map((pagina) => ({
        name_archivo: pagina.name_archivo,
        archivo_codigo_pagina: pagina.archivo_codigo_pagina,
        lenguaje: pagina.lenguaje,
      }))

      res.status(200).json(paginasagrupadas)
    } catch (error) {
      console.error("Error finding page:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
/*
    Funcionalidad: Buscar todas las páginas con el mismo ID y agruparlas

    Esto agarra de la base de datos la info como si YA FUERA un array
    necesito que HAGA un array de TODAS las filas DISTINTAS en la db con mismo id_pagina
*/

    const saveresponse = async (req, res) => {
        const { respuesta_ia } = req.params
        const personaId = req.personaId

        try {
            if ( !respuesta_ia ) {
                return res.status(400).json({ error: "missing data" })
            }

            const respuestaJSON = JSON.stringify(respuesta_ia)
            res.status(200).json({ message: "IA response saved successfully", pagina: paginaactualizada })
            respuestaJSON;
        } catch (error) {
            console.error("Error saving IA response:", error)
            res.status(500).json({ error: "Internal Server Error" })
        }
    }
/*
  Funcionalidad: Guardar respuesta de la IA que analiza
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
      if (!horario_inicio || horario_fin ) {
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
