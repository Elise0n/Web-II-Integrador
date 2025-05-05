import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import fetch from "node-fetch"

// Config del entorno
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const port = process.env.PORT || 3000

// Crear una instancia de Express
const app = express()

// Middleware para parsear JSON y formularios
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")))

// Almacenamiento en memoria
const users = {} // Almacena datos de usuarios
const gameSessions = {} // Almacena sesiones de juego
const ranking = [] // Almacena el rankingimport express from "express"

// Function to generate a random question
async function generateQuestion(country) {
  const questionType = Math.floor(Math.random() * 3) // 0, 1, o 2

  switch (questionType) {
    case 0: // Capital city question
      return {
        type: 0,
        question: `¿Cuál es el país de la capital ${country.capital?.[0] || "Desconocida"}?`,
        correctAnswer: country.name.common,
        options: [country.name.common],
      }
    case 1: // Flag question
      return {
        type: 1,
        question: `¿Qué país representa esta bandera?`,
        correctAnswer: country.name.common,
        flag: country.flags.png,
        options: [country.name.common],
      }
    case 2: // Bordering countries question
      return {
        type: 2,
        question: `¿Cuántos países limítrofes tiene ${country.name.common}?`,
        correctAnswer: country.borders ? country.borders.length : 0,
        options: [country.borders ? country.borders.length : 0],
      }
    default:
      return null
  }
}

// Function to shuffle array options
function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// API endpoint to start a new game
app.post("/api/start", async (req, res) => {
  try {
    const userId = Math.random().toString(36).substring(2, 15) // Generar ID aleatorio
    const playerName = req.body.playerName || "Anónimo"

    users[userId] = {
      name: playerName,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      startTime: Date.now(),
    }

    gameSessions[userId] = { questions: [], currentQuestionIndex: 0 }

    // Obtener países de la API
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,flags,borders")
    if (!response.ok) {
      throw new Error("Error al obtener los países")
    }

    const countries = await response.json()

    // Seleccionar 10 países aleatorios
    const randomCountries = []
    const usedIndices = new Set()

    while (randomCountries.length < 10 && usedIndices.size < countries.length) {
      const randomIndex = Math.floor(Math.random() * countries.length)
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex)
        randomCountries.push(countries[randomIndex])
      }
    }

    // Generar preguntas para la sesión de juego
    const questions = []
    for (const country of randomCountries) {
      try {
        const question = await generateQuestion(country)
        if (question) questions.push(question)
      } catch (error) {
        console.error("Error al generar pregunta para país:", country.name?.common, error)
      }
    }

    // Asegurar que tenemos suficientes preguntas
    if (questions.length < 5) {
      throw new Error("No se pudieron generar suficientes preguntas")
    }

    gameSessions[userId].questions = questions

    // Enviar la primera pregunta
    const firstQuestion = { ...gameSessions[userId].questions[0] }

    // Generar opciones para la primera pregunta
    if (firstQuestion.type !== 2) {
      // Para preguntas no numéricas
      const incorrectOptions = []
      const allCountryNames = countries.map((c) => c.name.common)

      while (incorrectOptions.length < 3) {
        const randomIndex = Math.floor(Math.random() * allCountryNames.length)
        const incorrectOption = allCountryNames[randomIndex]
        if (incorrectOption !== firstQuestion.correctAnswer && !incorrectOptions.includes(incorrectOption)) {
          incorrectOptions.push(incorrectOption)
        }
      }

      firstQuestion.options = shuffleArray([...incorrectOptions, firstQuestion.correctAnswer])
    } else {
      // Para preguntas numéricas (conteo de fronteras)
      const possibleAnswers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
      const incorrectOptions = possibleAnswers
        .filter((num) => num !== firstQuestion.correctAnswer)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)

      firstQuestion.options = shuffleArray([...incorrectOptions, firstQuestion.correctAnswer])
    }

    res.json({ userId: userId, question: firstQuestion })
  } catch (error) {
    console.error("Error al iniciar juego:", error)
    res.status(500).json({ error: "Error al iniciar juego", message: error.message })
  }
})

// API endpoint to get a question
app.get("/api/question", (req, res) => {
  try {
    const userId = req.query.userId

    if (!userId || !gameSessions[userId]) {
      return res.status(400).json({ error: "ID de usuario inválido o expirado" })
    }

    const questionIndex = gameSessions[userId].currentQuestionIndex

    if (questionIndex >= gameSessions[userId].questions.length) {
      return res.json({ message: "Juego terminado" })
    }

    const question = { ...gameSessions[userId].questions[questionIndex] }

    // Asegurar que las opciones estén mezcladas
    if (question.options && question.options.length > 1) {
      question.options = shuffleArray(question.options)
    }

    res.json(question)
  } catch (error) {
    console.error("Error al obtener pregunta:", error)
    res.status(500).json({ error: "Error al obtener pregunta", message: error.message })
  }
})

// API endpoint to submit an answer
app.post("/api/answer", (req, res) => {
  try {
    const userId = req.body.userId
    const answer = req.body.answer

    if (!userId || !gameSessions[userId]) {
      return res.status(400).json({ error: "ID de usuario inválido o expirado" })
    }

    const questionIndex = gameSessions[userId].currentQuestionIndex

    if (questionIndex >= gameSessions[userId].questions.length) {
      return res.status(400).json({ error: "Juego ya completado" })
    }

    const question = gameSessions[userId].questions[questionIndex]
    const isCorrect = answer.toString() === question.correctAnswer.toString()

    if (isCorrect) {
      users[userId].score += question.type === 1 ? 5 : 3 // 5 puntos para preguntas de bandera, 3 para otras
      users[userId].correctAnswers++
      res.json({ correct: true, message: "¡Correcto!" })
    } else {
      users[userId].incorrectAnswers++
      res.json({
        correct: false,
        message: `Incorrecto. La respuesta correcta es ${question.correctAnswer}`,
      })
    }

    gameSessions[userId].currentQuestionIndex++
  } catch (error) {
    console.error("Error al enviar respuesta:", error)
    res.status(500).json({ error: "Error al enviar respuesta", message: error.message })
  }
})

// API endpoint to get game statistics
app.get("/api/stats", (req, res) => {
  try {
    const userId = req.query.userId

    if (!userId || !users[userId]) {
      return res.status(400).json({ error: "ID de usuario inválido o expirado" })
    }

    const endTime = Date.now()
    const totalTime = (endTime - users[userId].startTime) / 1000 // Tiempo total en segundos
    const totalQuestions = users[userId].correctAnswers + users[userId].incorrectAnswers
    const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0

    res.json({
      playerName: users[userId].name,
      score: users[userId].score,
      correctAnswers: users[userId].correctAnswers,
      incorrectAnswers: users[userId].incorrectAnswers,
      totalTime: totalTime,
      averageTime: averageTime,
    })

    // Guardar en el ranking si el juego está completo
    if (totalQuestions >= 10) {
      const gameData = {
        playerName: users[userId].name,
        score: users[userId].score,
        correctAnswers: users[userId].correctAnswers,
        totalTime: totalTime,
      }

      ranking.push(gameData)

      // Ordenar el ranking
      ranking.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score // Ordenar por puntuación (descendente)
        } else if (b.correctAnswers !== a.correctAnswers) {
          return b.correctAnswers - a.correctAnswers // Luego por respuestas correctas (descendente)
        } else {
          return a.totalTime - b.totalTime // Finalmente por tiempo total (ascendente)
        }
      })

      // Mantener solo los 20 mejores
      if (ranking.length > 20) {
        ranking.length = 20
      }
    }
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    res.status(500).json({ error: "Error al obtener estadísticas", message: error.message })
  }
})

// API endpoint to get the ranking
app.get("/api/ranking", (req, res) => {
  try {
    res.json(ranking)
  } catch (error) {
    console.error("Error al cargar el ranking:", error)
    res
      .status(500)
      .json({ error: "Error al cargar el ranking. Por favor, inténtalo de nuevo.", message: error.message })
  }
})

// API endpoint to save a game
app.post("/api/games", (req, res) => {
  try {
    const gameData = req.body

    // Validar datos mínimos
    if (!gameData.playerName || typeof gameData.score !== "number") {
      return res.status(400).json({ error: "Datos de juego incompletos" })
    }

    // Añadir al ranking
    ranking.push(gameData)

    // Ordenar el ranking
    ranking.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score // Ordenar por puntuación (descendente)
      } else if (b.correctAnswers !== a.correctAnswers) {
        return b.correctAnswers - a.correctAnswers // Luego por respuestas correctas (descendente)
      } else {
        return a.totalTime - b.totalTime // Finalmente por tiempo total (ascendente)
      }
    })

    // Mantener solo los 20 mejores
    if (ranking.length > 20) {
      ranking.length = 20
    }

    res.json({ success: true, message: "Partida guardada correctamente" })
  } catch (error) {
    console.error("Error al guardar partida:", error)
    res.status(500).json({ error: "Error al guardar partida", message: error.message })
  }
})

// Route for the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Add a health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Route for 404 error
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"))
})

// Start the server
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`)
})


// Function to generate a random question
async function generateQuestion(country) {
  const questionType = Math.floor(Math.random() * 3) // 0, 1, o 2

  switch (questionType) {
    case 0: // Capital city question
      return {
        type: 0,
        question: `¿Cuál es el país de la capital ${country.capital?.[0] || "Desconocida"}?`,
        correctAnswer: country.name.common,
        options: [country.name.common],
      }
    case 1: // Flag question
      return {
        type: 1,
        question: `¿Qué país representa esta bandera?`,
        correctAnswer: country.name.common,
        flag: country.flags.png,
        options: [country.name.common],
      }
    case 2: // Bordering countries question
      return {
        type: 2,
        question: `¿Cuántos países limítrofes tiene ${country.name.common}?`,
        correctAnswer: country.borders ? country.borders.length : 0,
        options: [country.borders ? country.borders.length : 0],
      }
    default:
      return null
  }
}

// Function to shuffle array options
function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// API endpoint to start a new game
app.post("/api/start", async (req, res) => {
  try {
    const userId = Math.random().toString(36).substring(2, 15) // Generar ID aleatorio
    const playerName = req.body.playerName || "Anónimo"

    users[userId] = {
      name: playerName,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      startTime: Date.now(),
    }

    gameSessions[userId] = { questions: [], currentQuestionIndex: 0 }

    // Obtener países de la API
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,flags,borders")
    if (!response.ok) {
      throw new Error("Error al obtener los países")
    }

    const countries = await response.json()

    // Seleccionar 10 países aleatorios
    const randomCountries = []
    const usedIndices = new Set()

    while (randomCountries.length < 10 && usedIndices.size < countries.length) {
      const randomIndex = Math.floor(Math.random() * countries.length)
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex)
        randomCountries.push(countries[randomIndex])
      }
    }

    // Generar preguntas para la sesión de juego
    const questions = []
    for (const country of randomCountries) {
      try {
        const question = await generateQuestion(country)
        if (question) questions.push(question)
      } catch (error) {
        console.error("Error al generar pregunta para país:", country.name?.common, error)
      }
    }

    // Asegurar que tenemos suficientes preguntas
    if (questions.length < 5) {
      throw new Error("No se pudieron generar suficientes preguntas")
    }

    gameSessions[userId].questions = questions

    // Enviar la primera pregunta
    const firstQuestion = { ...gameSessions[userId].questions[0] }

    // Generar opciones para la primera pregunta
    if (firstQuestion.type !== 2) {
      // Para preguntas no numéricas
      const incorrectOptions = []
      const allCountryNames = countries.map((c) => c.name.common)

      while (incorrectOptions.length < 3) {
        const randomIndex = Math.floor(Math.random() * allCountryNames.length)
        const incorrectOption = allCountryNames[randomIndex]
        if (incorrectOption !== firstQuestion.correctAnswer && !incorrectOptions.includes(incorrectOption)) {
          incorrectOptions.push(incorrectOption)
        }
      }

      firstQuestion.options = shuffleArray([...incorrectOptions, firstQuestion.correctAnswer])
    } else {
      // Para preguntas numéricas (conteo de fronteras)
      const possibleAnswers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
      const incorrectOptions = possibleAnswers
        .filter((num) => num !== firstQuestion.correctAnswer)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)

      firstQuestion.options = shuffleArray([...incorrectOptions, firstQuestion.correctAnswer])
    }

    res.json({ userId: userId, question: firstQuestion })
  } catch (error) {
    console.error("Error al iniciar juego:", error)
    res.status(500).json({ error: "Error al iniciar juego", message: error.message })
  }
})

// API endpoint to get a question
app.get("/api/question", (req, res) => {
  try {
    const userId = req.query.userId

    if (!userId || !gameSessions[userId]) {
      return res.status(400).json({ error: "ID de usuario inválido o expirado" })
    }

    const questionIndex = gameSessions[userId].currentQuestionIndex

    if (questionIndex >= gameSessions[userId].questions.length) {
      return res.json({ message: "Juego terminado" })
    }

    const question = { ...gameSessions[userId].questions[questionIndex] }

    // Asegurar que las opciones estén mezcladas
    if (question.options && question.options.length > 1) {
      question.options = shuffleArray(question.options)
    }

    res.json(question)
  } catch (error) {
    console.error("Error al obtener pregunta:", error)
    res.status(500).json({ error: "Error al obtener pregunta", message: error.message })
  }
})

// API endpoint to submit an answer
app.post("/api/answer", (req, res) => {
  try {
    const userId = req.body.userId
    const answer = req.body.answer

    if (!userId || !gameSessions[userId]) {
      return res.status(400).json({ error: "ID de usuario inválido o expirado" })
    }

    const questionIndex = gameSessions[userId].currentQuestionIndex

    if (questionIndex >= gameSessions[userId].questions.length) {
      return res.status(400).json({ error: "Juego ya completado" })
    }

    const question = gameSessions[userId].questions[questionIndex]
    const isCorrect = answer.toString() === question.correctAnswer.toString()

    if (isCorrect) {
      users[userId].score += question.type === 1 ? 5 : 3 // 5 puntos para preguntas de bandera, 3 para otras
      users[userId].correctAnswers++
      res.json({ correct: true, message: "¡Correcto!" })
    } else {
      users[userId].incorrectAnswers++
      res.json({
        correct: false,
        message: `Incorrecto. La respuesta correcta es ${question.correctAnswer}`,
      })
    }

    gameSessions[userId].currentQuestionIndex++
  } catch (error) {
    console.error("Error al enviar respuesta:", error)
    res.status(500).json({ error: "Error al enviar respuesta", message: error.message })
  }
})

// API endpoint to get game statistics
app.get("/api/stats", (req, res) => {
  try {
    const userId = req.query.userId

    if (!userId || !users[userId]) {
      return res.status(400).json({ error: "ID de usuario inválido o expirado" })
    }

    const endTime = Date.now()
    const totalTime = (endTime - users[userId].startTime) / 1000 // Tiempo total en segundos
    const totalQuestions = users[userId].correctAnswers + users[userId].incorrectAnswers
    const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0

    res.json({
      playerName: users[userId].name,
      score: users[userId].score,
      correctAnswers: users[userId].correctAnswers,
      incorrectAnswers: users[userId].incorrectAnswers,
      totalTime: totalTime,
      averageTime: averageTime,
    })

    // Guardar en el ranking si el juego está completo
    if (totalQuestions >= 10) {
      const gameData = {
        playerName: users[userId].name,
        score: users[userId].score,
        correctAnswers: users[userId].correctAnswers,
        totalTime: totalTime,
      }

      ranking.push(gameData)

      // Ordenar el ranking
      ranking.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score // Ordenar por puntuación (descendente)
        } else if (b.correctAnswers !== a.correctAnswers) {
          return b.correctAnswers - a.correctAnswers // Luego por respuestas correctas (descendente)
        } else {
          return a.totalTime - b.totalTime // Finalmente por tiempo total (ascendente)
        }
      })

      // Mantener solo los 20 mejores
      if (ranking.length > 20) {
        ranking.length = 20
      }
    }
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    res.status(500).json({ error: "Error al obtener estadísticas", message: error.message })
  }
})

// API endpoint to get the ranking
app.get("/api/ranking", (req, res) => {
  try {
    res.json(ranking)
  } catch (error) {
    console.error("Error al cargar el ranking:", error)
    res
      .status(500)
      .json({ error: "Error al cargar el ranking. Por favor, inténtalo de nuevo.", message: error.message })
  }
})

// API endpoint to save a game
app.post("/api/games", (req, res) => {
  try {
    const gameData = req.body

    // Validar datos mínimos
    if (!gameData.playerName || typeof gameData.score !== "number") {
      return res.status(400).json({ error: "Datos de juego incompletos" })
    }

    // Añadir al ranking
    ranking.push(gameData)

    // Ordenar el ranking
    ranking.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score // Ordenar por puntuación (descendente)
      } else if (b.correctAnswers !== a.correctAnswers) {
        return b.correctAnswers - a.correctAnswers // Luego por respuestas correctas (descendente)
      } else {
        return a.totalTime - b.totalTime // Finalmente por tiempo total (ascendente)
      }
    })

    // Mantener solo los 20 mejores
    if (ranking.length > 20) {
      ranking.length = 20
    }

    res.json({ success: true, message: "Partida guardada correctamente" })
  } catch (error) {
    console.error("Error al guardar partida:", error)
    res.status(500).json({ error: "Error al guardar partida", message: error.message })
  }
})

// Route for the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Add a health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Route for 404 error
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"))
})

// Start the server
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`)
})
