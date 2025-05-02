const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para archivos estáticos
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

// empezar el servidor 
app.listen(port, () => {
  console.log(`Juego de Banderas en el puerto ${port}`);
});