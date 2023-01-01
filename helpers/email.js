import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
    const {nombre, email, token} = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });


    // Información del email
    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Confirma tu cuenta',
        text: 'Comprueba tu cuenta en UpTask',
        html: `
            <p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
            <p>
                Tu cuenta ya está casi lista, solo debes comprobarla en el siguiente enlace:
                <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>
            </p>
            <p>Si tú no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })
}

export const emailOlvidePassword = async (datos) => {
    const {nombre, email, token} = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });


    // Información del email
    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Restablece tu contraseña',
        text: 'Restablece tu contraseña',
        html: `
            <p>Hola: ${nombre} has solicitado restablecer tu contraseña</p>
            <p>
                Sigue el siguiente enlace para restablecer tu contraseña:
                <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer Contraseña</a>
            </p>
            <p>Si tú solicitaste este email, puedes ignorar el mensaje</p>
        `
    })
}
