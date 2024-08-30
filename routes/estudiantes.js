import express from "express";
import bycrypt from 'bcryptjs';
import admin from 'firebase-admin';
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from '../config/firebaseServiceAccount.json' with { type: 'json'};

// Exportaciones de funciones para manejar el Token
import { verifyToken, generateToken } from "./auth.js";


// Inicializar firebase:
admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
});

const router = express.Router();
const db = admin.firestore();
const estudiantesCollection = db.collection('estudiantes');


/* =====> Login <======== */
router.post('/login', async(req, res) => {
   const { usuario, password } = req.body;
   const findUser = await estudiantesCollection.where('usuario', '==', usuario).get();
   
   if(findUser.empty) {
      return res.status(400).json({
         error: 'El usuario no existe!!'
      });
   }

   // El hecho de que se genere doc, es porque si encontro la variable 
   const userDoc = findUser.docs[0];
   const user = userDoc.data()

   // Validamos si la contraseña que mandamos es la misma que esta en la BD.
   const validarPassword = await bycrypt.compare(password, user.password); 
   // Aunque el pass este encriptado compara (Primera letra que escribimos en el form | contraseña de la BD encriptada)

   if(!validarPassword) {
      return res.status(400).json({
         error: 'Contraseña Inválida!!'
      });
    }

   /* ====> Generacion de Token <==== */
   const token = generateToken({
      id: userDoc.id,
      usuario: user.usuario
   })
   res.status(201).json({
      token
   })
})

/* Middleware (Token)*/
function authToken(req, res, next) {
   const authHeader = req.header('Authorization');
  //  const authHeader = req.header.authorization;
   // Validamos si recibio token:
   const token = authHeader && authHeader.split(' ')[1];

   if(!token) {
      return res.status(401).json({ message: 'No Autorizado'})
   }

   try {
      const userToken = verifyToken(token);
      req.user = userToken;
      next();
   } catch (err) {
      res.sendStatus(403);
   }
}


/* Endpoint para crear estudiantes */
router.post('/create', authToken, async(req, res) => {
   // Obtenemos parametros del body, asignandolos a las sig constantes:
   const { nombre, apaterno, amaterno, direccion, 
      telefono, correo, usuario, password} = req.body

   // Validar correo y usuario
   const findUser = await estudiantesCollection.where('usuario', '==', usuario).get();
   const findEmail = await estudiantesCollection.where('correo', '==', correo).get();

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
   const passHash = await bycrypt.hash(password, 10);

   await estudiantesCollection.add({
      nombre,
      apaterno,
      amaterno,
      direccion,
      telefono,
      correo,
      usuario,
      password: passHash 
   });

   // Suponiendo que se hizo correctamente la conexion:
   res.status(200).json({
      message: 'User create sucess'
   });
});

/* Endpoint para obtener usuarios: */
router.get('/usuarios', authToken, async (req, res) => {
   try {
      // Obtenemos la coleccion 
      const coleccionUsuarios = await estudiantesCollection.get();
      const usuarios = coleccionUsuarios.docs.map((row) => ({
      id: row.id,
      ...row.data()
   }));
   res.status(200).json({
      message: 'success',
      usuarios
   });
   } catch (error) {
      res.status(400).json({
         error: 'No se puede obtener el usuario'
      })
   }
});


/* Endpoint para obtener usuarios por ID: */
router.get('/estudiante_id/:id', authToken, async (req, res) => {
   // Obtenemos la coleccion 
   const id = req.params.id; // Obtenemos el ID del parámetro de la URL
   const coleccionUsuarios = await estudiantesCollection.doc(id).get(); // .doc para ir al documento y obtener el id
   
   if(!coleccionUsuarios.exists) {
      return res.status(401).json({
          message: 'Error getting users by id!'
      });
   }
   res.status(201).json({
      message: 'Success, user found:',
      estudiante: { 
         id: coleccionUsuarios.id,
          ...coleccionUsuarios.data()
      }
   });
});

/* Endpoint para actualizar usuarios por ID: */
router.put('/update_study/:id', authToken, async(req, res) =>{
   // Desde el front se manda el objeto con la informacion actualizada! Para que se sust en la db
   try {
      const id_url = req.params.id;
      const collEstUpdate = req.body;
      await estudiantesCollection.doc(id_url).set(collEstUpdate, { merge: true });

      res.status(200).json({
         message: 'User update success',
         id: id_url,
         ...collEstUpdate
      })
   } catch (error) {
      res.status(400).json({
         message: `ERROR!= cannot uptate user ${error}`
      })
   }
});

/* Endpoint para eliminar usuarios: */
router.delete('/delete_study/:id', authToken, async(req, res) => {
   try {
      const id_url = req.params.id; // Obtenemos el ID por el parametro de la URL.
      const collEstuDelete = await estudiantesCollection.doc(id_url).delete(); // Obtenemos el doc corresp al ID

      res.status(200).json({
         message: 'User deleted success'  
      })
   } catch (error) {
      res.status(400).json({
         message: 'Error!= unable delete user'
      });
   }
});

export default router