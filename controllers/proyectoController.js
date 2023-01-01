import mongoose from "mongoose";
import Proyecto from "../models/Proyecto.js";
import {request, response} from "express";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
    // Obtener proyectos de la persona la cual ha iniciado sesión
    const proyectos = await Proyecto.find({
        $or: [
            { colaboradores: {$in: req.usuario} },
            { creador: {$in: req.usuario} },
        ]
    }).select('-tareas');
    res.status(200).json(proyectos);
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body);

    // Agregar el creador
    proyecto.creador = req.usuario._id;

    try {
        const proyectoAlmacenado = await proyecto.save();
        return res.status(201).json(proyectoAlmacenado);
    } catch (e) {
        console.log(e);
    }
}

const obtenerProyecto = async (req, res) => {
    const {id} = req.params;

    // Validar que sea un ID de mongo
    const validId = mongoose.Types.ObjectId.isValid(id);
    if (!validId) {
        const error = new Error('El ID que ingresaste no es válido');
        return res.status(403).json({msg: error.message});
    }

    const proyecto = await Proyecto.findById(id)
        .populate({path: 'tareas', populate: {path: 'completado', select: 'nombre'}})
        .populate('colaboradores', 'nombre email'); // traer nombre e email de colaboradores
    if (!proyecto) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({msg: error.message});
    }

    // Revisar que la persona quién está tratando de acceder al proyecto, es quién lo cró, si no es él
    // no tiene el acceso permitido...
    if (
        proyecto.creador.toString() !== req.usuario._id.toString()
        && !proyecto?.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())
    ) {
        const error = new Error('Acción no válida o no tienes los permisos necesarios');
        return res.status(401).json({msg: error.message});
    }

    res.status(200).json(proyecto);
}

const editarProyecto = async (req, res) => {
    const {id} = req.params;

    const validId = mongoose.Types.ObjectId.isValid(id);
    if (!validId) {
        const error = new Error('El ID que ingresaste no es válido');
        return res.status(403).json({msg: error.message});
    }

    const proyecto = await Proyecto.findById(id);
    if (!proyecto) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({msg: error.message});
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida o no tienes los permisos necesarios');
        return res.status(401).json({msg: error.message});
    }

   // proyecto.nombre = req.body.nombre || proyecto.nombre;
   // proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
   // proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
   // proyecto.cliente = req.body.cliente || proyecto.cliente;

   try {
       // const proyectoAlmacenado = await proyecto.save();
       const proyectoAlmacenado = await Proyecto.findByIdAndUpdate(id, req.body, { new: true });
       res.status(200).json(proyectoAlmacenado);
   } catch (e) {
       console.log(e);
   }
}

const eliminarProyecto = async (req, res) => {
    const {id} = req.params;

    const validId = mongoose.Types.ObjectId.isValid(id);
    if (!validId) {
        const error = new Error('El ID que ingresaste no es válido');
        return res.status(403).json({msg: error.message});
    }

    const proyecto = await Proyecto.findById(id);
    if (!proyecto) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({msg: error.message});
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida o no tienes los permisos necesarios');
        return res.status(401).json({msg: error.message});
    }

    try {
        await proyecto.deleteOne();
        res.status(200).json({msg: 'Proyecto eliminado correctamente'});
    } catch (e) {
        console.log(e);
    }

}

const buscarColaborador = async (req=request, res=response) => {
    const {email} = req.body;

    // Revisar si ese usuario está registrado
    const usuario = await Usuario.findOne({email}).select('-password -confirmado -updatedAt -createdAt -token -__v');
    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    res.json(usuario);
}

const agregarColaborador = async (req=request, res=response) => {
    const {id} = req.params;
    const {email} = req.body;

    const proyecto = await Proyecto.findById(id);
    if (!proyecto) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({msg: error.message});
    }

    // Quién creo el proyecto puede agregar colaboradores
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(403).json({msg: error.message});
    }

    const usuario = await Usuario.findOne({email}).select('-password -confirmado -updatedAt -createdAt -token -__v');
    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    // El colaborador no es el admin del proyecto
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error('El creador del proyecto no puede ser colaborador');
        return res.status(401).json({msg: error.message});
    }

    // Revisar que no esté ya agregado al proyecto
    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El usuario ya pertenece al proyecto');
        return res.status(403).json({msg: error.message});
    }

    // Agregar
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();

    res.status(201).json({msg: 'Colaborador agregado correctamente'})

}
const eliminarColaborador = async (req, res) => {
    const {id} = req.params;

    const proyecto = await Proyecto.findById(id);
    if (!proyecto) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({msg: error.message});
    }

    // Quién creo el proyecto puede agregar colaboradores
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(403).json({msg: error.message});
    }

    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();

    res.status(200).json({msg: 'Colaborador eliminado correctamente'})

}


export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
}
