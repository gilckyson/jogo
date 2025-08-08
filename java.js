// --- Elementos do DOM ---
const wordDisplay = document.getElementById('wordDisplay');
const typingInput = document.getElementById('typingInput');
const timeLeftSpan = document.getElementById('timeLeft');
const scoreSpan = document.getElementById('score');
const statusMessage = document.getElementById('statusMessage');
const startButton = document.getElementById('startButton');

// --- Variáveis do Jogo ---
let score = 0;
let timeLeft = 10;
let currentWord = '';
let gameInterval;
let isGameRunning = false;

// --- Lista de palavras (adicione mais aqui!) ---
const words = [
    'JAVASCRIPT', 'PROGRAMACAO', 'TECNOLOGIA', 'COMPUTADOR', 'DESENVOLVEDOR',
    'FRONTEND', 'BACKEND', 'ALGORITMO', 'APLICACAO', 'CODIGO', 'VELOCIDADE'
];

// --- Funções do Jogo ---

function startGame() {
    isGameRunning = true;
    score = 0;
    scoreSpan.innerText = score;
    statusMessage.innerText = '';
    startButton.style.display = 'none';
    typingInput.disabled = false;
    typingInput.focus();
    newWord();
}

function newWord() {
    if (gameInterval) clearInterval(gameInterval);
    
    // Seleciona uma palavra aleatória
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];
    wordDisplay.innerText = currentWord;
    
    typingInput.value = '';
    timeLeft = 10;
    timeLeftSpan.innerText = timeLeft;
    
    // Inicia o contador
    gameInterval = setInterval(() => {
        timeLeft--;
        timeLeftSpan.innerText = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function checkWord() {
    const typedWord = typingInput.value.toUpperCase();
    if (typedWord === currentWord) {
        score++;
        scoreSpan.innerText = score;
        newWord();
    }
}

function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    statusMessage.innerText = `Fim de Jogo! Sua pontuação foi ${score}.`;
    startButton.style.display = 'block';
    startButton.innerText = 'Jogar Novamente';
    typingInput.disabled = true;
    wordDisplay.innerText = '';
}

// --- Eventos ---
typingInput.addEventListener('input', checkWord);
startButton.addEventListener('click', startGame);

// --- Inicia o jogo ---
startButton.innerText = 'Começar';
typingInput.disabled = true;
