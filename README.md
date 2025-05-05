# Gamer-Themed Trivia Game

A fun, interactive trivia game with a gamer aesthetic that tests your knowledge about countries around the world. The game features neon styling, multiple question types, and a competitive leaderboard.

![Trivia Game Screenshot](screenshot.png)

## Features

- 🎮 Gamer-themed UI with neon colors and engaging design
- 🌍 Uses the restcountries.com API for authentic country data
- 🎯 Three different question types:
  - Capital city identification
  - Flag recognition
  - Border country counting
- ⏱️ Time tracking for each game session
- 🏆 Leaderboard showing top 20 players
- 📊 Game statistics including score, correct/incorrect answers, and time

## Technologies Used

- **Backend**: Node.js with Express
- **Frontend**: HTML, CSS (Bootstrap), and vanilla JavaScript
- **API**: RESTCountries API (restcountries.com)
- **Deployment**: Render

## Installation and Setup

1. Clone the repository:
   \`\`\`
   git clone https://github.com/yourusername/trivia-game.git
   cd trivia-game
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Start the server:
   \`\`\`
   npm start
   \`\`\`

4. Open your browser and navigate to:
   \`\`\`
   http://localhost:3000
   \`\`\`

## API Documentation

The game provides the following API endpoints:

### Start a New Game
- **URL**: `/start`
- **Method**: `POST`
- **Description**: Initializes a new game session and returns the first question
- **Response**: 
  \`\`\`json
  {
    "userId": "random-user-id",
    "question": {
      "type": 0,
      "question": "What is the country of the capital city Paris?",
      "correctAnswer": "France",
      "options": ["France", "Germany", "Spain", "Italy"]
    }
  }
  \`\`\`

### Get a Question
- **URL**: `/question`
- **Method**: `GET`
- **Query Parameters**: `userId`
- **Description**: Retrieves the current question for the specified user
- **Response**: 
  \`\`\`json
  {
    "type": 1,
    "question": "This flag represents which country?",
    "correctAnswer": "Japan",
    "flag": "https://restcountries.com/data/jpn.svg",
    "options": ["China", "Japan", "South Korea", "Vietnam"]
  }
  \`\`\`

### Submit an Answer
- **URL**: `/answer`
- **Method**: `POST`
- **Body Parameters**: `userId`, `answer`
- **Description**: Submits an answer and returns whether it was correct
- **Response**: 
  \`\`\`json
  {
    "correct": true,
    "message": "Correct!"
  }
  \`\`\`

### Get Game Statistics
- **URL**: `/stats`
- **Method**: `GET`
- **Query Parameters**: `userId`
- **Description**: Retrieves statistics for the current game
- **Response**: 
  \`\`\`json
  {
    "score": 28,
    "correctAnswers": 8,
    "incorrectAnswers": 2,
    "totalTime": 120.5,
    "averageTime": 12.05
  }
  \`\`\`

### Get Ranking
- **URL**: `/ranking`
- **Method**: `GET`
- **Description**: Retrieves the top 20 players ranked by score
- **Response**: 
  \`\`\`json
  [
    {
      "userId": "user1",
      "score": 42,
      "correctAnswers": 10,
      "incorrectAnswers": 0,
      "startTime": 1621500000000
    },
    // More entries...
  ]
  \`\`\`

## How to Play

1. Open the game in your browser
2. Click "Start Game" to begin
3. Answer each question by selecting one of the provided options
4. After answering all 10 questions, you'll see your final score and statistics
5. Check the leaderboard to see how you rank against other players

## Project Structure

\`\`\`
trivia-game/
├── app.js                # Main server file with API endpoints
├── package.json          # Project dependencies
├── public/               # Frontend files
│   ├── index.html        # Main HTML file
│   ├── style.css         # CSS styling
│   └── script.js         # Frontend JavaScript
└── README.md             # This file
\`\`\`

## License

MIT License
