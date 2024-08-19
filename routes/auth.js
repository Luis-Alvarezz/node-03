// Archivo para Auth mediante las rutas 
import jwt from 'jsonwebtoken';
// Crea palabra SECRETA, se usa para CUBRIR el Token 
const top_secret = 'secretpassword';

// Generacion de Token con vida de 10 dias
export function generateToken (payload) {
   return jwt.sign(payload, top_secret, { expiresIn: '10d'});
}

// Validacion de token:
export function verifyToken(token) {
   return jwt.verify(token, top_secret);
}