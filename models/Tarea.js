import {model, Schema} from "mongoose";

const tareaSchema = new Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
        descripcion: {
            type: String,
            required: true,
            trim: true,
        },
        estado: {
            type: Boolean,
            default: false,
        },
        fechaEntrega: {
            type: Date,
            required: true,
            default: Date.now(),
        },
        prioridad: {
            type: String,
            required: true,
            enum: ['Baja', 'Media', 'Alta'],
        },
        proyecto: {
            type: Schema.Types.ObjectId,
            ref: 'Proyecto',
        },
        completado: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
        }
    },
    {
        timestamps: true,
    }
)

const Tarea = model('Tarea', tareaSchema);
export default Tarea;
