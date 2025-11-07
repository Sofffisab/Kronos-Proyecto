import { prisma } from '../prisma/prisma.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';


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

    return {login, signup, updateuserprofile};
};

export default setupsesiones;