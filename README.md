# JUEGODEBANDERAS

Juego de Banderas
Un juego de trivia interactivo y divertido con estética gamer que pone a prueba tu conocimiento sobre países del mundo. El juego presenta un estilo neón, varios tipos de preguntas y un ranking competitivo.

## Funcionalidades


- 🎮 Interfaz de usuario con temática gamer, colores neón y un diseño atractivo.
- 🌍 Usa la API restcountries.com para obtener datos auténticos de los países.
- 🎯 Tres tipos de preguntas diferentes:
  - Identificación de capitales de países.
  - Reconocimiento de banderas.
  - Conteo de países limítrofes.
- ⏱️ Seguimiento del tiempo para cada sesión de juego.
- 🏆 Ranking que muestra a los 20 mejores jugadores.
- 📊 Estadísticas del juego, incluyendo puntaje, respuestas correctas/incorretas y tiempo.

## Tecnologías Utilizadas

- **Backend**: Node.js con Express
- **Frontend**: HTML, CSS (Bootstrap) y JavaScript puro.
- **API**: RESTCountries API (restcountries.com).
- **Deployment**: Vercel

## Instalación y Configuración

1. Clona el repositorio:
   
   git clone https://github.com/Elise0n/Web-II-Integrador.git
   cd Web-II-Integrador
   

2. Instala las dependencias:
   
   npm install
  

3. Inicia el servidor:
   
   npm start
   

4. Abre tu navegador y navega a:
   
   http://localhost:3000
   

## Documentación de la API

El juego ofrece los siguientes endpoints de la API:

### Iniciar un Nuevo Juego
- **URL**: `/start`
- **Método**: `POST`
- **Descripción**: Inicializa una nueva sesión de juego y devuelve la primera pregunta.
- **Respuesta:**: 
  \`\`\`json
 {
  "userId": "id-usuario-aleatorio",
  "question": {
    "type": 0,
    "question": "¿Cuál es el país de la capital de París?",
    "correctAnswer": "Francia",
    "options": ["Francia", "Alemania", "España", "Italia"]
  }
}
  \`\`\`

### Obtener una Pregunta
- **URL**: `/question`
- **Método**: `GET`
- **Parámetros de Consulta**: `userId`
- **Descripción**: Recupera la pregunta actual para el usuario especificado.
- **Respuesta**: 
  \`\`\`json
 {
  "type": 1,
  "question": "¿Qué país representa esta bandera?",
  "correctAnswer": "Japón",
  "flag": "https://restcountries.com/data/jpn.svg",
  "options": ["China", "Japón", "Corea del Sur", "Vietnam"]
}
  \`\`\`

### Enviar una Respuesta
- **URL**: `/answer`
- **Método**: `POST`
- **Parámetros del Cuerpo**: `userId`, `answer`
- **Descripción**: Envía una respuesta y devuelve si fue correcta o no.
- **Respuesta**: 
  \`\`\`json
  {
    "correct": true,
    "message": "Correct!"
  }
  \`\`\`

### Obtener Estadísticas del Juego
- **URL**: `/stats`
- **Método**: `GET`
- **Parámetros de Consulta**: `userId`
- **Descripción**: Retrieves statistics for the current game
- **Respuesta**: 
  \`\`\`json
  {
    "score": 28,
    "correctAnswers": 8,
    "incorrectAnswers": 2,
    "totalTime": 120.5,
    "averageTime": 12.05
  }
  \`\`\`

### Obtener el Ranking
- **URL**: `/ranking`
- **Método**: `GET`
- **Descripción**: Retrieves the top 20 players ranked by score
- **Respuesta**: 
  \`\`\`json
  [
  {
    "userId": "usuario1",
    "score": 42,
    "correctAnswers": 10,
    "incorrectAnswers": 0,
    "startTime": 1621500000000
  },
  // Más entradas...
]

  \`\`\`

## Cómo Jugar

0. Abre el juego en tu navegador.
1. Ingresa tu nombre[ID]
2. Haz clic en "Iniciar Juego" para comenzar.
3. Responde cada pregunta seleccionando una de las opciones proporcionadas.
4. Después de responder las 10 preguntas, verás tu puntaje final y las estadísticas.
5. Consulta el ranking para ver cómo te comparas con otros jugadores.

## Estructura del Proyecto

\`\`\`
Web-II-Integrador/
├── app.js                # Archivo principal del servidor con los endpoints de la API
├── package.json          # Dependencias del proyecto
├── public/               # Archivos del frontend
│   ├── index.html        # Página principal
│   ├── style.css         # Estilos CSS
│   └── script.js         # JavaScript del frontend
└── README.md             # Este archivo
\`\`\`

## Licencia

MIT License
