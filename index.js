
import express from 'express'; // Servidor Web que activamos para enviar peticiones, etc
import bodyParser from 'body-parser'; // Indicar el intermediadio entre back y front
import estudiantesRoutes from './routes/estudiantes.js';


// Inicializar firebase:
// admin.initializeApp({
//    credential: admin.credential.cert(serviceAccount)
// });

// Inicializamos Servidor:
const app = express();
const PORT = process.env.PORT || 4000;
app.use(bodyParser.json()); 

// Manejo de las rutas:
app.use('/api/estudiantes', estudiantesRoutes);

app.listen(PORT, () => {
   console.log(`Servidor corriendo en ${PORT}`);
   
});