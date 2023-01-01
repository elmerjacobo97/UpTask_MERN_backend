import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { conectarDB } from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();

// Procesar la información de tipo JSON
app.use(express.json());

// Variables de entorno
dotenv.config();

// Conectar a MongoDB
conectarDB();

// configurar CORS
const whiteList = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.includes(origin)) {
            // Puede consultar la API
            callback(null, true);
        } else {
            // No tiene los permisos
            callback(new Error('Not allowed by CORS'));
        }
    },
};

app.use(cors(corsOptions));

// Routing
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

// Puerto
const PORT = process.env.PORT || 4000;
const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Socket.io
import { Server } from 'socket.io';

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    },
});

// Abrir una connection
io.on('connection', (socket) => {
    console.log('Conectado a socket.io')

    // Definir los eventos de Socket.io
    socket.on('abrir proyecto', (proyectoId) => {
        socket.join(proyectoId); // EL "proyectoId" ES DEL PROYECTO
    })

    socket.on('nueva tarea', (tarea) => {
        socket.to(tarea.proyecto).emit('tarea agregada', tarea);
    })

    socket.on('eliminar tarea', (tarea) => {
        socket.to(tarea.proyecto).emit('tarea eliminada', tarea);
    })

    socket.on('actualizar tarea', (tarea) => {
        socket.to(tarea.proyecto).emit('tarea actualizada', tarea);
    })

    socket.on('cambiar estado', (tarea) => {
        console.log(tarea)
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit('nuevo estado', tarea);
    })
})
