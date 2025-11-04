import { prisma } from '../prisma/prisma.js';

//mirkin
const setupiapaginas = () => {

    const subir = async (req, res) => {
        const {usuarioI, mailI, contraseniaP} = req.body;
        let archivos = [];
        
        try {

            const persona = await prisma.persona.create({
                data: {
                    usuario: usuario,
                    nombre: nombre,
                    mail: mail,
                    contrasenia: contrasenia,

                },
            });

        } catch (error) {
            
        };
        
    };

    const buscar = async (req, res) => {
        const {id} = req.params;
        
        try {

            persona = await prisma.persona.findMany({ 
                    where: { 
                        id: id
                    } 
            });
            
        } catch (error){
            
        };
    }
    
    return {subir, buscar};
};

export default setupiapaginas;

//july]