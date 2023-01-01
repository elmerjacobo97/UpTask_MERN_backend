import mongoose from 'mongoose';

export const conectarDB = async () => {
    try {
        mongoose.set('strictQuery', false); // solución a un warning

        const connection = await mongoose.connect(process.env.MONGO_URI);
        const url = `${connection?.connection.host}:${connection?.connection.port}`;
        console.log(`MongoDB conectado en: ${url}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
        process.exit(1);
    }
}
