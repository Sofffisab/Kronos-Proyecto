import { prisma } from '../prisma/prisma.js';

const setuppersonalizaciones = () => {

  const getpersonalizaciones = async (req, res) => {
    const personaId = req.personaId;

    try {
      const personalizacion = await prisma.personalizaciones.findFirst({
        where: {
          id_persona: personaId,
        },
      });

      if (!personalizacion) {
        return res.status(200).json({ message: "no customizations found", personalizacion: null });
      };

      res.status(200).json(personalizacion);
    } catch (error) {
      console.error("Error getting customizations:", error);
      res.status(500).json({ 
        error: "Internal Server Error",
        retry: true 
      });
    };
  };

  const updatepersonalizaciones = async (req, res) => {
    const personaId = req.personaId;
    const { headerSize, font, mainColor, secondaryColor, tertiaryColor, textColor } = req.body;

    try {
      if (!headerSize && !font && !mainColor && !secondaryColor && !tertiaryColor && !textColor) {
        return res.status(400).json({ error: "missing data" });
      };

      let cssCode = ":root {\n";

      if (headerSize) {
        const size = Number.parseInt(headerSize, 10);
        if (isNaN(size) || size < 12 || size > 24) {
          return res.status(400).json({ error: "headerSize must be between 12 and 24" });
        };
        cssCode += `  --headerSize: ${size}px;\n`;
        cssCode += `  --biggerHeaderSize: ${size + 4}px;\n`;
        cssCode += `  --smallerheaderSize: ${size - 2}px;\n`;
      };

      if (font) {
        cssCode += `  --font: ${font};\n`;
      };

      if (mainColor) {
        cssCode += `  --mainColor: ${mainColor};\n`;
      };
      if (secondaryColor) {
        cssCode += `  --secondaryColor: ${secondaryColor};\n`;
      };
      if (tertiaryColor) {
        cssCode += `  --tertiaryColor: ${tertiaryColor};\n`;
      };
      if (textColor) {
        cssCode += `  --textColor: ${textColor};\n`;
      };

      cssCode += "}";

      const existingpersonalizacion = await prisma.personalizaciones.findFirst({
        where: {
          id_persona: personaId,
        },
      });

      let personalizacion;

      if (existingpersonalizacion) {
        personalizacion = await prisma.personalizaciones.update({
          where: {
            id: existingpersonalizacion.id,
          },
          data: {
            codigo_a_insertar: cssCode,
          },
        });
      } else {
        personalizacion = await prisma.personalizaciones.create({
          data: {
            id_persona: personaId,
            codigo_a_insertar: cssCode,
          },
        });
      };

      res.status(200).json({ message: "customizations updated successfully", personalizacion: personalizacion });
    } catch (error) {
      console.error("Error updating customizations:", error);
      res.status(500).json({ 
        error: "Internal Server Error",
        retry: true 
      });
    };
  };

  const deletepersonalizaciones = async (req, res) => {
    const personaId = req.personaId;

    try {
      const existingpersonalizacion = await prisma.personalizaciones.findFirst({
        where: {
          id_persona: personaId,
        },
      });

      if (!existingpersonalizacion) {
        return res.status(404).json({ error: "No customizations found to delete" });
      };

      await prisma.personalizaciones.delete({
        where: {
          id: existingpersonalizacion.id,
        },
      });

      res.status(200).json({ message: "customizations deleted successfully" });
    } catch (error) {
      console.error("Error deleting customizations:", error);
      res.status(500).json({ 
        error: "Internal Server Error",
        retry: true 
      });
    };
  };

  return { getpersonalizaciones, updatepersonalizaciones, deletepersonalizaciones };
};

export default setuppersonalizaciones;
