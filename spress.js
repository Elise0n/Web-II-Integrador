import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Config del entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000; //puerto para el servidor

// Crear una instancia de Express
const app = express();


// Middleware para enviar archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Parsea URL-cuerpos codificados (asi como lo hacen los formularios HTML)
app.use(express.urlencoded({ extended: true }));

// guarda datos en memoria (reemplaza con una base de datos para producción)
let users = {};
let gameSessions = {};
let ranking = [];

// config motor de vizualizacion (aunque servimos archivos estáticos, podemos usar un motor de plantillas para renderizar HTML dinámicamente)
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas para error 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// empezar el servidor 
app.listen(port, () => {
  console.log(`Servido Express ejecutandose en http://localhost:${port}`);
});