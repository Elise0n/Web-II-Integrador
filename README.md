# Web-II-Integrador
Juego de Banderas

Un divertido e interactivo juego de preguntas y repuestas, pone a prueba tus conocimientos sobre paises de todo el mundo ya sea como sus banderas, capitales y paises limitrofes.

## Características

- 🎮 Interfaz de usuario con temática de juego, colores neón y un diseño atractivo
- 🌍 Utiliza la API de restcountries.com para obtener datos auténticos de los países
- 🎯 Tres tipos de preguntas diferentes:
- Identificación de la capital
- Reconocimiento de la bandera
- Conteo de países limítrofes
- ⏱️ Registro del tiempo en cada sesión de juego
- 🏆 Tabla de clasificación con los 20 mejores jugadores
- 📊 Estadísticas del juego, incluyendo puntuación, respuestas correctas/incorrectas y tiempo

## Technologias usadas

- **Backend**: Node.js con Express
- **Frontend**: HTML, CSS (Bootstrap), y vanilla JavaScript
- **API**: RESTCountries API (restcountries.com)
- **Deployment**: Render

## Instalación y configuración

1. Clonar el repositorio:
\`\`\`
git clone https://github.com/Elise0n/Web-II-Integrador.git
\`\`\`

2. Instalar las dependencias:
\`\`\`
npm install
\`\`\`

3. Iniciar el servidor:
\`\`\`
npm start
\`\`\`

4. Abrir el navegador y navegar a:
\`\`\`
http://localhost:3000
\`\`\`

## Documentación de la API

El juego proporciona los siguientes puntos finales de la API:

### Iniciar una nueva partida
- **URL**: `/start`
- **Método**: `POST`
- **Descripción**: Inicializa una nueva sesión de juego y devuelve la primera pregunta
- **Respuesta**:
\`\`\`json
{
"userId": "random-user-id",
"question": {
"type": 0,
"question": "¿Cuál es el país de la capital, París?",
"correctAnswer": "Francia",
"options": ["Francia", "Alemania", "España", "Italia"]
}
}
\`\`\`

### Obtener una pregunta
- **URL**: `/question`
- **Método**: `GET`
- **Parámetros de consulta**: `userId`
- **Descripción**: Obtiene la pregunta actual del usuario especificado
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

### Enviar una respuesta
- **URL**: `/answer`
- **Método**: `POST`
- **Parámetros del cuerpo**: `userId`, `answer`
- **Descripción**: Envía una respuesta e indica si es correcta
- **Respuesta**:
\`\`\`json
{
"correct": true,
"message": "¡Correcto!"
}
\`\`\`

### Obtener estadísticas del juego
- **URL**: `/stats`
- **Método**: `GET`
- **Parámetros de consulta**: `userId`
- **Descripción**: Obtiene las estadísticas del juego actual
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

### Obtener clasificación
- **URL**: `/ranking`
- **Método**: `GET`
- **Descripción**: Obtiene los 20 mejores jugadores clasificados por puntuación
- **Respuesta**:
\`\`\`json
[
{
"userId": "usuario1",
"puntuación": 42,
"respuestascorrectas": 10,
"respuestasincorrectas": 0,
"horaInicio": 1621500000000
},
// Más entradas...
]
\`\`\`

## Cómo jugar

0. Abre el juego en tu navegador.
1. Ingresa tu nombre [ID]
2. Haz clic en "Iniciar juego" para empezar.
3. Responde a cada pregunta seleccionando una de las opciones proporcionadas.
4. Después de responder las 10 preguntas, verás tu puntuación final y las estadísticas.
5. Consulta la tabla de clasificación para ver tu posición en comparación con otros jugadores.

## Estructura del proyecto

\`\`\`
Web-II-Integrador
├── app.js # Conexion con la api y el juego y guardado de mismos datos
├── spress.js # Archivo del servidor principal con los puntos finales de la API
├── package.json # Dependencias del proyecto
├── public/ # Archivos del frontend
| ├── 404.html # En caso de error muestra este html
│ ├── index.html # Archivo HTML principal
│ ├── style.css # Estilo CSS
│ └── script.js # JavaScript para frontend
└── README.md # Este archivo
\`\`\`

## Licencia

Licencia ISC
