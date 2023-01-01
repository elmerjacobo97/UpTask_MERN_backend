import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

export const checkAuth = async (req, res, next) => {
    let token;

    // Si hay authorization y esa authorization empieza con Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Almacenar el usuario autenticado
            req.usuario = await Usuario.findById(decoded.id)
                .select('-password -confirmado -token -createdAt -updatedAt -__v');

            // console.log(req.usuario);
            return next();
        } catch (e) {
            console.log(e);
            return res.status(404).json({msg: 'Hubo un error'});
        }
    }

    if (!token) {
        const error = new Error('Token no válido');
        return res.status(403).json({msg: error.message});
    }

    next();
}
