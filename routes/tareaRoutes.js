import {Router} from "express";
import {checkAuth} from "../middleware/checkAuth.js";
import {
    actualizarTarea,
    agregarTarea,
    cambiarEstado,
    eliminarTarea,
    obtenerTarea
} from "../controllers/tareaController.js";

const router = Router();

router.post('/', checkAuth, agregarTarea);
router.route('/:id')
    .get(checkAuth, obtenerTarea)
    .put(checkAuth, actualizarTarea)
    .delete(checkAuth, eliminarTarea);
router.post('/estado/:id', checkAuth, cambiarEstado);

export default router;
