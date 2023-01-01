import {model, Schema} from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = new Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        token: {
            type: String,
        },
        confirmado: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

// Este code se va a ejecutar antes de almacenarlo en BD
usuarioSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);

    // this hace referencia al objeto de usuario
    this.password = await bcrypt.hash(this.password, salt);
})

// Comprobar su password
usuarioSchema.methods.comprobarPassword = async function(passwordForm) {
    return await bcrypt.compare(passwordForm, this.password);
}

const Usuario = model('Usuario', usuarioSchema);
export default Usuario;
