// Variables globales
let countries = [] // guardara los datos de países
let currentQuestion = 0 // Índice de la pregunta actual
let score = 0 // Puntaje acumulado
let correctAnswers = 0 // Respuestas correctas
let incorrectAnswers = 0 // Respuestas incorrectas
let gameStartTime // Tiempo de inicio del juego
let questionStartTime // Tiempo de inicio de la pregunta actual
let totalGameTime = 0 // Tiempo total de juego en segundos
let questionTimes = [] // Tiempos de cada pregunta
let gameInterval // Intervalo para el temporizador del juego
let questionInterval // Intervalo para el temporizador de la pregunta
let currentPlayer = "" // Nombre del jugador actual
let questions = [] // Preguntas generadas para el juego

// Elementos DOM
const startScreen = document.getElementById("start-screen")
const gameScreen = document.getElementById("game-screen")
const resultsScreen = document.getElementById("results-screen")
const rankingScreen = document.getElementById("ranking-screen")

const playerNameInput = document.getElementById("player-name")
const startBtn = document.getElementById("start-btn")
const rankingBtn = document.getElementById("ranking-btn")
const playAgainBtn = document.getElementById("play-again-btn")
const resultsRankingBtn = document.getElementById("results-ranking-btn")
const backBtn = document.getElementById("back-btn")

const totalTimerEl = document.getElementById("total-timer")
const questionTimerEl = document.getElementById("question-timer")
const currentQuestionEl = document.getElementById("current-question")
const questionTypeEl = document.getElementById("question-type")
const questionTextEl = document.getElementById("question-text")
const flagContainerEl = document.getElementById("flag-container")
const optionsContainerEl = document.getElementById("options-container")
const feedbackContainerEl = document.getElementById("feedback-container")

const correctAnswersEl = document.getElementById("correct-answers")
const incorrectAnswersEl = document.getElementById("incorrect-answers")
const finalScoreEl = document.getElementById("final-score")
const totalTimeEl = document.getElementById("total-time")
const avgTimeEl = document.getElementById("avg-time")
const rankingTableBodyEl = document.getElementById("ranking-table-body")

// Tipos de preguntas
const QUESTION_TYPES = {
  CAPITAL: {
    id: "capital",
    text: "¿Cuál es el país de la siguiente ciudad capital?",
    points: 3,
  },
  FLAG: {
    id: "flag",
    text: "Este país está representado por esta bandera",
    points: 5,
  },
  BORDERS: {
    id: "borders",
    text: "¿Cuántos países limítrofes tiene el siguiente país?",
    points: 3,
  },
}

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Cargar datos de países
    await loadCountries()

    // Event listeners
    startBtn.addEventListener("click", startGame)
    rankingBtn.addEventListener("click", showRanking)
    playAgainBtn.addEventListener("click", resetGame)
    resultsRankingBtn.addEventListener("click", showRanking)
    backBtn.addEventListener("click", () => {
      hideAllScreens()
      startScreen.classList.add("active")
    })
  } catch (error) {
    console.error("Error al inicializar el juego:", error)
    alert("Error al cargar los datos. Por favor, recarga la página.")
  }
})

/**
 * Carga los datos de países desde la API
 */
async function loadCountries() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,flags,borders")
    countries = await response.json()

    // Filtrar países que tienen todos los datos necesarios
    countries = countries.filter(
      (country) => country.name && country.capital && country.capital.length > 0 && country.flags && country.flags.png,
    )

    console.log(`Cargados ${countries.length} países`)
  } catch (error) {
    console.error("Error al cargar países:", error)
    throw error
  }
}

/**
 * Inicia el juego
 */
function startGame() {
  currentPlayer = playerNameInput.value.trim()

  if (!currentPlayer) {
    alert("Por favor, ingresa tu nombre para comenzar")
    return
  }

  // Reiniciar variables
  currentQuestion = 0
  score = 0
  correctAnswers = 0
  incorrectAnswers = 0
  questionTimes = []

  // Generar preguntas aleatorias
  generateQuestions()

  // Mostrar pantalla de juego
  hideAllScreens()
  gameScreen.classList.add("active")

  // Iniciar temporizadores
  startTimers()

  // Mostrar primera pregunta
  showQuestion(currentQuestion)
}

/**
 * Genera 10 preguntas aleatorias para el juego
 */
function generateQuestions() {
  questions = []

  // Asegurar que haya al menos una pregunta de cada tipo
  questions.push(generateQuestion(QUESTION_TYPES.CAPITAL))
  questions.push(generateQuestion(QUESTION_TYPES.FLAG))
  questions.push(generateQuestion(QUESTION_TYPES.BORDERS))

  // Generar el resto de preguntas aleatorias
  for (let i = 3; i < 10; i++) {
    const randomType = getRandomQuestionType()
    questions.push(generateQuestion(randomType))
  }

  // Mezclar las preguntas
  questions = shuffleArray(questions)
}

/**
 * Genera una pregunta del tipo especificado
 */
function generateQuestion(questionType) {
  const randomCountryIndex = Math.floor(Math.random() * countries.length)
  const correctCountry = countries[randomCountryIndex]

  const question = {
    type: questionType,
    correctAnswer: null,
    options: [],
    countryData: correctCountry,
  }

  // Configurar la pregunta según su tipo
  switch (questionType.id) {
    case "capital":
      question.text = `¿Cuál es el país de la capital ${correctCountry.capital[0]}?`
      question.correctAnswer = correctCountry.name.common
      question.options = generateOptions(correctCountry.name.common, "name")
      break

    case "flag":
      question.text = "Este país está representado por esta bandera"
      question.flagUrl = correctCountry.flags.png
      question.correctAnswer = correctCountry.name.common
      question.options = generateOptions(correctCountry.name.common, "name")
      break

    case "borders":
      const bordersCount = correctCountry.borders ? correctCountry.borders.length : 0
      question.text = `¿Cuántos países limítrofes tiene ${correctCountry.name.common}?`
      question.correctAnswer = bordersCount.toString()

      // Generar opciones para la cantidad de fronteras
      const options = [bordersCount.toString()]
      while (options.length < 4) {
        // Generar un número aleatorio entre 0 y 14 (la mayoría de países tienen menos de 15 fronteras)
        const randomBorders = Math.floor(Math.random() * 15)
        if (!options.includes(randomBorders.toString())) {
          options.push(randomBorders.toString())
        }
      }
      question.options = shuffleArray(options)
      break
  }

  return question
}

/**
 * Genera opciones para una pregunta, incluyendo la respuesta correcta
 */
function generateOptions(correctAnswer, property) {
  const options = [correctAnswer]

  // Añadir 3 opciones incorrectas aleatorias
  while (options.length < 4) {
    const randomCountryIndex = Math.floor(Math.random() * countries.length)
    const randomOption =
      property === "name" ? countries[randomCountryIndex].name.common : countries[randomCountryIndex][property]

    if (!options.includes(randomOption)) {
      options.push(randomOption)
    }
  }

  // Mezclar las opciones
  return shuffleArray(options)
}

/**
 * Obtiene un tipo de pregunta aleatorio
 */
function getRandomQuestionType() {
  const types = [QUESTION_TYPES.CAPITAL, QUESTION_TYPES.FLAG, QUESTION_TYPES.BORDERS]
  const randomIndex = Math.floor(Math.random() * types.length)
  return types[randomIndex]
}

/**
 * Mezcla un array (algoritmo Fisher-Yates)
 */
function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

/**
 * Inicia los temporizadores del juego
 */
function startTimers() {
  // Tiempo total del juego
  gameStartTime = new Date()
  gameInterval = setInterval(() => {
    const currentTime = new Date()
    const elapsedSeconds = Math.floor((currentTime - gameStartTime) / 1000)
    totalGameTime = elapsedSeconds
    totalTimerEl.textContent = formatTime(elapsedSeconds)
  }, 1000)

  // Tiempo de la pregunta actual
  startQuestionTimer()
}

/**
 * Inicia el temporizador para la pregunta actual
 */
function startQuestionTimer() {
  // Reiniciar el temporizador de la pregunta anterior
  if (questionInterval) {
    clearInterval(questionInterval)
  }

  questionStartTime = new Date()
  questionInterval = setInterval(() => {
    const currentTime = new Date()
    const elapsedSeconds = Math.floor((currentTime - questionStartTime) / 1000)
    questionTimerEl.textContent = formatTime(elapsedSeconds)
  }, 1000)
}

/**
 * Formatea el tiempo en segundos a formato MM:SS
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

/**
 * Muestra la pregunta actual
 */
function showQuestion(index) {
  const question = questions[index]

  // Actualizar contador de preguntas
  currentQuestionEl.textContent = index + 1

  // Mostrar tipo de pregunta
  questionTypeEl.textContent = question.type.text
  questionTypeEl.className = "question-type neon-text-amber"

  // Mostrar texto de la pregunta
  questionTextEl.textContent = question.text

  // Mostrar bandera si es una pregunta de tipo bandera
  if (question.type.id === "flag") {
    flagContainerEl.innerHTML = `<img src="${question.flagUrl}" alt="Bandera del país">`
    flagContainerEl.style.display = "block"
  } else {
    flagContainerEl.style.display = "none"
  }

  // Generar opciones
  optionsContainerEl.innerHTML = ""
  question.options.forEach((option, i) => {
    const optionBtn = document.createElement("button")
    optionBtn.className = "option-btn"
    optionBtn.textContent = option
    optionBtn.dataset.value = option
    optionBtn.addEventListener("click", () => checkAnswer(option))
    optionsContainerEl.appendChild(optionBtn)
  })

  // Ocultar feedback
  feedbackContainerEl.style.display = "none"

  // Reiniciar temporizador de pregunta
  startQuestionTimer()
}

/**
 * Verifica la respuesta seleccionada
 */
function checkAnswer(selectedAnswer) {
  const question = questions[currentQuestion]
  const isCorrect = selectedAnswer === question.correctAnswer

  // Registrar tiempo de la pregunta
  const currentTime = new Date()
  const questionTime = Math.floor((currentTime - questionStartTime) / 1000)
  questionTimes.push(questionTime)

  // Actualizar estadísticas
  if (isCorrect) {
    score += question.type.points
    correctAnswers++
  } else {
    incorrectAnswers++
  }

  // Mostrar feedback
  showFeedback(isCorrect, question.correctAnswer)

  // Deshabilitar opciones
  const optionBtns = optionsContainerEl.querySelectorAll(".option-btn")
  optionBtns.forEach((btn) => {
    btn.disabled = true

    if (btn.dataset.value === question.correctAnswer) {
      btn.classList.add("correct")
    } else if (btn.dataset.value === selectedAnswer && !isCorrect) {
      btn.classList.add("incorrect")
    }
  })

  // Pasar a la siguiente pregunta después de un breve retraso
  setTimeout(() => {
    currentQuestion++

    if (currentQuestion < questions.length) {
      showQuestion(currentQuestion)
    } else {
      endGame()
    }
  }, 2000)
}

/**
 * Muestra feedback después de responder
 */
function showFeedback(isCorrect, correctAnswer) {
  feedbackContainerEl.innerHTML = isCorrect
    ? '<p class="feedback-correct">¡Correcto! +' + questions[currentQuestion].type.points + " puntos</p>"
    : '<p class="feedback-incorrect">Incorrecto. La respuesta correcta es: ' + correctAnswer + "</p>"

  feedbackContainerEl.style.display = "block"
}

/**
 * Finaliza el juego y muestra los resultados
 */
function endGame() {
  // Detener temporizadores
  clearInterval(gameInterval)
  clearInterval(questionInterval)

  // Calcular tiempo promedio por pregunta
  const avgTimeSeconds = Math.floor(questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length)

  // Actualizar pantalla de resultados
  correctAnswersEl.textContent = correctAnswers
  incorrectAnswersEl.textContent = incorrectAnswers
  finalScoreEl.textContent = score
  totalTimeEl.textContent = formatTime(totalGameTime)
  avgTimeEl.textContent = formatTime(avgTimeSeconds)

  // Guardar partida en el servidor
  saveGame({
    playerName: currentPlayer,
    score: score,
    correctAnswers: correctAnswers,
    totalTime: totalGameTime,
    avgTime: avgTimeSeconds,
  })

  // Mostrar pantalla de resultados
  hideAllScreens()
  resultsScreen.classList.add("active")
}

/**
 * Guarda la partida en el servidor
 */
async function saveGame(gameData) {
  try {
    const response = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameData),
    })

    if (!response.ok) {
      throw new Error("Error al guardar la partida")
    }

    console.log("Partida guardada correctamente")
  } catch (error) {
    console.error("Error al guardar la partida:", error)
  }
}

/**
 * Muestra el ranking de mejores partidas
 */
async function showRanking() {
  try {
    // Obtener ranking del servidor
    const response = await fetch("/api/ranking")
    const ranking = await response.json()

    // Limpiar tabla
    rankingTableBodyEl.innerHTML = ""

    // Mostrar ranking
    ranking.forEach((game, index) => {
      const row = document.createElement("tr")

      row.innerHTML = `
                <td>${index + 1}</td>
                <td>${game.playerName}</td>
                <td>${game.score}</td>
                <td>${game.correctAnswers}</td>
                <td>${formatTime(game.totalTime)}</td>
            `

      rankingTableBodyEl.appendChild(row)
    })

    // Mostrar pantalla de ranking
    hideAllScreens()
    rankingScreen.classList.add("active")
  } catch (error) {
    console.error("Error al cargar el ranking:", error)
    alert("Error al cargar el ranking. Por favor, inténtalo de nuevo.")
  }
}

/**
 * Oculta todas las pantallas
 */
function hideAllScreens() {
  startScreen.classList.remove("active")
  gameScreen.classList.remove("active")
  resultsScreen.classList.remove("active")
  rankingScreen.classList.remove("active")
}

/**
 * Reinicia el juego
 */
function resetGame() {
  hideAllScreens()
  startScreen.classList.add("active")
  playerNameInput.value = currentPlayer
}
