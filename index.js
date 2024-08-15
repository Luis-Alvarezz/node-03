
import express from 'express'; // Servidor Web que activamos para enviar peticiones, etc
import bodyParser from 'body-parser'; // Indicar el intermediadio entre back y front
import admin from 'firebase-admin';
import estudiantesRouter from './routes/estudiantes.js';
import serviceAccount from './config/firebaseServiceAccount.json' with { type: 'json'};

// Inicializar firebase:
admin.initializeApp({
   credential: admin.credential.cert(serviceAccount)
});

// Inicializamos Servidor:
const app = express();
const PORT = process.env.PORT || 4000;
app.use(bodyParser.json()); 

// Manejo de las rutas:
app.use('/api/estudiantes', estudiantesRouter);

app.listen(PORT, () => {
   console.log(`Servidor corriendo en ${PORT}`);
   
});