import mongoose from "mongoose";
import {request, response} from "express";
import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req=request, res= response) => {
    const {proyecto} = req.body;

    const validId = mongoose.Types.ObjectId.isValid(proyecto);
    if (!validId) {
        const error = new Error('El ID que ingresaste no es válido');
        return res.status(403).json({msg: error.message});
    }

    const existeProyecto = await Proyecto.findById(proyecto);
    if (!existeProyecto) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({msg: error.message});
    }

    // Comprobar quién creo ese proyecto puede añadir tareas
    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No tienes los permisos adecuados');
        return res.status(401).json({msg: error.message});
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body);

        // Almacenar el ID de la tarea en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id);
        await existeProyecto.save();

        res.json(tareaAlmacenada);
    } catch (e) {
        console.log(e);
    }
}

const obtenerTarea = async (req=request, res= response) => {
    const {id} = req.params;

    const validId = mongoose.Types.ObjectId.isValid(id);
    if (!validId) {
        const error = new Error('El ID que ingresaste no es válido');
        return res.status(403).json({msg: error.message});
    }

    const tarea = await Tarea.findById(id).populate('proyecto');
    if (!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida o no tienes los permisos');
        return res.status(401).json({msg: error.message});
    }

    res.status(200).json(tarea);
}

const actualizarTarea = async (req=request, res= response) => {
    const {id} = req.params;

    const validId = mongoose.Types.ObjectId.isValid(id);
    if (!validId) {
        const error = new Error('El ID que ingresaste no es válido');
        return res.status(403).json({msg: error.message});
    }

    const tarea = await Tarea.findById(id).populate('proyecto');
    if (!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida o no tienes los permisos');
        return res.status(401).json({msg: error.message});
    }

    try {
        const tareaAlmacenada = await Tarea.findByIdAndUpdate(id, req.body, {new: true});
        res.status(200).json(tareaAlmacenada);
    } catch (e) {
        console.log(e);
    }
}

const eliminarTarea = async (req=request, res= response) => {
    const {id} = req.params;

    const validId = mongoose.Types.ObjectId.isValid(id);
    if (!validId) {
        const error = new Error('El ID que ingresaste no es válido');
        return res.status(403).json({msg: error.message});
    }

    const tarea = await Tarea.findById(id).populate('proyecto');
    if (!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    if (tarea?.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida o no tienes los permisos');
        return res.status(401).json({msg: error.message});
    }

    try {
        const proyecto = await Proyecto.findById(tarea?.proyecto);
        proyecto.tareas.pull(tarea?._id);

        await Promise.allSettled([ await proyecto.save(), await tarea.deleteOne()])

        res.status(200).json({msg: 'Tarea eliminada correctamente'});
    } catch (e) {
        console.log(e);
    }
}

const cambiarEstado = async (req=request, res= response) => {
    const {id} = req.params;

    const validId = mongoose.Types.ObjectId.isValid(id);
    if (!validId) {
        const error = new Error('El ID que ingresaste no es válido');
        return res.status(403).json({msg: error.message});
    }

    const tarea = await Tarea.findById(id).populate('proyecto');
    if (!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    if (
        tarea.proyecto.creador.toString() !== req.usuario._id.toString()
        && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())
    ) {
        const error = new Error('Acción no válida o no tienes los permisos');
        return res.status(401).json({msg: error.message});
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;
    await tarea.save();

    const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado');

    res.json(tareaAlmacenada);
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
}
