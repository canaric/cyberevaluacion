const express = require('express');
const fetch = require('node-fetch');  // Necesitas instalar node-fetch si no lo tienes
const bodyParser = require('body-parser');
require('dotenv').config(); // Cargar las variables de entorno del archivo .env

const app = express();
const port = process.env.PORT || 3000;

// Clave secreta de Google reCAPTCHA
const secretKey = process.env.RECAPTCHA_SECRET_KEY;  // Usamos la variable de entorno RECAPTCHA_SECRET_KEY

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());

// Ruta para verificar el reCAPTCHA
app.post('/verify-recaptcha', async (req, res) => {
    const token = req.body.token;  // El token recibido desde el frontend

    // Verificar el token con Google
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            body: new URLSearchParams({
                secret: secretKey,  // La secret key de reCAPTCHA
                response: token,    // El token recibido del cliente
            }),
        });

        const data = await response.json();

        if (data.success) {
            // El token es válido, puedes proceder con el examen
            res.status(200).json({ message: 'Token válido' });
        } else {
            // El token no es válido
            res.status(400).json({ message: 'Token inválido' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el reCAPTCHA', error: error.message });
    }
});

// Servir archivos estáticos desde el directorio 'public' (donde estarán tus archivos HTML, JS, etc.)
app.use(express.static('public'));

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});


