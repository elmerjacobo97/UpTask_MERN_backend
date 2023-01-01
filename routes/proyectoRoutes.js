import {Router} from "express";
import {checkAuth} from "../middleware/checkAuth.js";
import {
    agregarColaborador, buscarColaborador,
    editarProyecto, eliminarColaborador,
    eliminarProyecto,
    nuevoProyecto,
    obtenerProyecto,
    obtenerProyectos
} from "../controllers/proyectoController.js";

const router = Router();

router.route('/')
    .get(checkAuth, obtenerProyectos)
    .post(checkAuth, nuevoProyecto);

router.route('/:id')
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto);

router.post('/colaboradores', checkAuth, buscarColaborador);
router.post('/colaboradores/:id', checkAuth, agregarColaborador); // EL ID ES DEL PROYECTO
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador);

export default router;
