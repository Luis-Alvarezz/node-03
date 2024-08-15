import express from "express";
import bycrpt from 'bcryptjs';
import admin from 'firebase-admin';
import { getFirestore } from "firebase-admin/firestore";


const router = express.Router()
const db = getFirestore();
const estudiantesCollection = db.estudiantesCollection('esdiantes');

// Crear estudiantes:
router.post('/create', async(req, res) => {
   // Body a mandar en la URL a la Base de datos
   const { nombre, apaterno, amaterno, direccion, 
      telefono, correo, usuario, password} = req.body

   // Validar correo y usuario
   const findUser = await estudiantesCollection.where('usuario', '===', usuario).get();
   const findEmail = await estudiantesCollection.where('correo', '===', correo).get();

   if(!findUser.empty) {
      return res.status(400).json({
         error: ('El usuario ya existe...')
      });
   }

   if(!findEmail.empty) {
      return res.status(400).json({
         error: ('El correo ya existe...')
      });
   }

   // Encriptar Contraseña:
   const passHash = await bycrpt.hash(password, 10);

   await estudiantesCollection.add({
      nombre,
      apaterno,
      amaterno,
      direccion,
      telefono,
      correo,
      password: passHash
   });

   // Suponiendo que se hizo correctamente la conexion:
   res.status(200).json({
      message: 'sucess'
   });
});