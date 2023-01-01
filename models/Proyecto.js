import {model, Schema} from "mongoose";

const proyectoSchema = new Schema(
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
        fechaEntrega: {
            type: Date,
            default: Date.now(),
        },
        cliente: {
            type: String,
            required: true,
            trim: true,
        },
        creador: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
        },
        tareas: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Tarea',
            }
        ],
        colaboradores: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Usuario',
            }
        ]
    },
    {
        timestamps: true,
    }
)

const Proyecto = model('Proyecto', proyectoSchema);
export default Proyecto;
