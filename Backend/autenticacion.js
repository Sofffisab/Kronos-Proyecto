import jwt from 'jsonwebtoken';
const setupautenticacion = (JWT_SECRET) => {

    const authentication = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        
        try {   
            const decoded = jwt.verify(token, JWT_SECRET);
            req.personaId = decoded.personaId;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        };
    };

    return { authentication }; 
};

export default setupautenticacion;