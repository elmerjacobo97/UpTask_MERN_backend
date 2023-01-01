import Usuario from "../models/Usuario.js";
import {generarId} from "../helpers/generarId.js";
import {generarJWT} from "../helpers/generarJWT.js";
import {emailOlvidePassword, emailRegistro} from "../helpers/email.js";

const registrar = async (req, res) => {
    const {email} = req.body;

    // Evitar registro duplicados
    const existeUser = await Usuario.findOne({email});
    if (existeUser) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg: error.message});
    }

    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        await usuario?.save();

        // Enviar el email de confirmación
        await emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token,
        })

        res.status(201).json({msg: 'Usuario creado correctamente, revisa tu email para confirmar tu cuenta'});
    } catch (e) {
        console.log(e);
    }
}

const autenticar = async (req, res) => {
    const {email, password} = req.body;

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({email});
    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg: error.message});
    }

    // Comprobar si el usuario está confirmado
    if (!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({msg: error.message});
    }

    // Comprobar su password
    if (await usuario.comprobarPassword(password)) {
        return res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id),
        })
    } else {
        const error = new Error('La contraseña es incorrecta');
        return res.status(403).json({msg: error.message});
    }
}

const confirmar = async (req, res) => {
    const {token} = req.params;
    const usuarioConfirmar = await Usuario.findOne({token});

    if (!usuarioConfirmar) {
        const error = new Error('Token no válido');
        return res.status(403).json({msg: error.message});
    }

    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = '';
        await usuarioConfirmar?.save();
        res.status(200).json({msg: 'Usuario confirmado correctamente'});
    } catch (e) {
        console.log(e);
    }
}

const olvidePassword = async (req, res) => {
    const {email} = req.body;

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({email});
    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg: error.message});
    }

    try {
        usuario.token = generarId();
        await usuario?.save();

        // Enviar el email para restablecer su password
        await emailOlvidePassword({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token,
        })

        res.status(200).json({msg: 'Hemos enviado un email con las instrucciones'});
    } catch (e) {
        console.log(e);
    }
}

const comprobarToken = async (req, res) => {
    const {token} = req.params;
    const tokenValid = await Usuario.findOne({token});
    if (tokenValid) {
        return res.status(200).json({msg: 'Token válido y el usuario existe'});
    } else {
        const error = new Error('Token no válido');
        return res.status(403).json({msg: error.message});
    }
}

const nuevoPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({token});
    if (usuario) {
        usuario.password = password;
        usuario.token = '';

        try {
            await usuario?.save();
            return res.status(200).json({msg: 'Contraseña modificada correctamente'});
        } catch (e) {
            console.log(e);
        }
    } else {
        const error = new Error('Token no válido');
        return res.status(403).json({msg: error.message});
    }
}

const perfil = async (req, res) => {
    const {usuario} = req;

    res.status(200).json(usuario);
}

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
}
