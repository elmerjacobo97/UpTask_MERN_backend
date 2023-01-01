import jwt from "jsonwebtoken";

export const generarJWT = (id) => {
    // Almacenar Id del usuario
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}
