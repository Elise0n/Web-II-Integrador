import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Config del entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000; //puerto para el servidor

// Crear una instancia de Express
const app = express();


// Middleware para enviar archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Parsea URL-cuerpos codificados (asi como lo hacen los formularios HTML)
//app.use(express.urlencoded({ extended: true }));

// guarda datos en memoria (reemplaza con una base de datos para producción)
let users = {};
let gameSessions = {};
// Array para almacenar el ranking
let gameRanking = [];

// Ruta para guardar el resultado del juego
app.post('/api/games', (req, res) => {
  const gameData = req.body;
 // Guardamos los datos de la partida
 gameRanking.push(gameData);

 // Ordenamos el ranking en función del puntaje (descendente)
 gameRanking = gameRanking.sort((a, b) => b.score - a.score);

 // Limitar a los 20 primeros jugadores
 gameRanking = gameRanking.slice(0, 20);

 // Respondemos con éxito
 res.status(200).json({ message: 'Juego guardado correctamente', ranking: gameRanking });
});

// Ruta para obtener el ranking
app.get('/api/ranking', (req, res) => {
 res.status(200).json(gameRanking);
});  

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