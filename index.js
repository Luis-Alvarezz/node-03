
import express from 'express'; // Servidor Web que activamos para enviar peticiones, etc
import bodyParser from 'body-parser'; // Indicar el intermediadio entre back y front
import cors from 'cors'; // Para el manejo del ingreso de DOMINIOS
import estudiantesRoutes from './routes/estudiantes.js';


// Inicializar firebase:
// admin.initializeApp({
//    credential: admin.credential.cert(serviceAccount)
// });

// Inicializamos Servidor:
const app = express();

const corsOption = {
   origin: '*',
   optionSuccessStatus: 200
}

const PORT = process.env.PORT || 4000;
app.use(cors(corsOption))
app.use(bodyParser.json()); 

// Manejo de las rutas:
app.use('/api/estudiantes', estudiantesRoutes);

app.listen(PORT, () => {
   console.log(`Servidor corriendo en ${PORT}`);
   
});