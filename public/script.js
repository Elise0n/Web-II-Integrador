document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = '<p>Game loading...</p>';
});


let questions = [];
let current = 0;
let score = 0;
let correct = 0;
let incorrect = 0;
let startTime = 0;
let duration = 0;
let timerInterval = null;

document.getElementById('start-button').addEventListener('click', async () => {
    questions = await generateQuestions();
    current = 0;
    score = 0;
    correct = 0;
    incorrect = 0;
    duration = [];
    showQuestion();
});

async function generateQuestions() {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    return data.questions;
}

        