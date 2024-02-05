const welcomeDiv = document.querySelector(`.welcome-div`);
const gameDiv = document.querySelector(`.game-div`);
const nameInput = document.getElementById(`nameInput`);
const playButton = document.getElementById(`playButton`);
const gameUsername = document.getElementById(`gameUsername`);
let playerName = null;
let selectedDifficulty = 'easy'; 


document.getElementById('easyBtn').addEventListener('click', () => showHighScores('easy'));
document.getElementById('mediumBtn').addEventListener('click', () => showHighScores('medium'));
document.getElementById('hardBtn').addEventListener('click', () => showHighScores('hard'));
document.getElementById('expertBtn').addEventListener('click', () => showHighScores('expert'));


function showHighScores(difficulty) {
    const highScoresContainer = document.getElementById('highScores');
    highScoresContainer.innerHTML = ''; 

    
    const highScores = JSON.parse(localStorage.getItem(`scores-${difficulty}`)) || [];
        
    const difficultyDiv = document.createElement('div');
    difficultyDiv.textContent = `Scoreboard for ${difficulty}`;
    difficultyDiv.classList.add('text-xl', 'font-bold', 'mb-2');
    highScoresContainer.appendChild(difficultyDiv);

    if (highScores.length === 0) {
        highScoresContainer.innerHTML = '<p>No high scores yet.</p>';
    } else {
        
        const table = document.createElement('table');
        table.classList.add('table-auto', 'border', 'border-collapse', 'w-full');

        
        const thead = document.createElement('thead');
        thead.classList.add('bg-gray-200');
        const headerRow = document.createElement('tr');
        const headers = ['Rank', 'Username', 'Time'];

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.classList.add('border', 'border-gray-400', 'px-4', 'py-2', 'text-left');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        
        const tbody = document.createElement('tbody');

        
        highScores.forEach((score, index) => {
            const tr = document.createElement('tr');
            const rank = document.createElement('td');
            const username = document.createElement('td');
            const time = document.createElement('td');

            tr.classList.add('bg-white');
            rank.classList.add('border', 'border-gray-400', 'px-4', 'py-2');
            username.classList.add('border', 'border-gray-400', 'px-4', 'py-2');
            time.classList.add('border', 'border-gray-400', 'px-4', 'py-2');

            rank.textContent = index + 1;
            username.textContent = score.username;
            time.textContent = score.time + ' seconds';

            tr.appendChild(rank);
            tr.appendChild(username);
            tr.appendChild(time);

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        highScoresContainer.appendChild(table);
    }
}




function saveScore(difficulty, username, time) {
    const scoresKey = `scores-${difficulty}`;
    let scores = JSON.parse(localStorage.getItem(scoresKey)) || [];

    scores.push({ username, time });

    
    scores.sort((a, b) => a.time - b.time);

    
    scores = scores.slice(0, 10);

    localStorage.setItem(scoresKey, JSON.stringify(scores));
}

playButton.addEventListener(`click`, () => {
    if (!nameInput.value) {
        nameInput.classList.add(`border`);
        nameInput.classList.add(`border-red-500`);
        alert(`Please type in your name!`);
    } else {
        welcomeDiv.classList.add(`hidden`);
        gameDiv.classList.remove(`hidden`);
        playerName = nameInput.value;
        gameUsername.value = playerName;
        startGame(); 
    }
});

let counterValue = 0;
let intervalId;

let openedCards = [];
let matchedPairs = 0;
let isFirstMove = true; 
let isFlipping = false;
let isGameStarted = false;
let hasGameWon = false;
let gridSize = 4; 
const maxImageNumber = 8; 


function startTimer() {
    if (intervalId) {
        clearInterval(intervalId);
    }

    counterValue = 0;

    
    intervalId = setInterval(() => {
        if (isGameStarted && !hasGameWon) {
            updateCounter();
        }
    }, 1000);
}


function updateCounter() {
    const counterSpan = document.getElementById('counter');

    counterValue++;

    counterSpan.textContent = counterValue;
}


function flipCard(card) {
    const cardNumber = card.dataset.number;

    
    if (isFlipping) {
        return;
    }

    
    if (!card.classList.contains('flipped')) {
        
        if (!isGameStarted) {
            startTimer();
            isGameStarted = true;
        }

        card.style.background = `url('./images/${(cardNumber % maxImageNumber) + 1}.png') center center / cover no-repeat`;
        card.classList.add('flipped');

        openedCards.push(card);

        
        if (openedCards.length === 2) {
            isFlipping = true; 

            
            const [card1, card2] = openedCards;

            if (card1.dataset.number === card2.dataset.number) {
                
                matchedPairs++;

                
                if (matchedPairs === gridSize * gridSize / 2) {
                    
                    clearInterval(intervalId);
                    alert(`Congratulations! You've matched all pairs. Time taken: ${counterValue} seconds.`);
                    
                    
                    saveScore(selectedDifficulty, playerName, counterValue);
                    
                    hasGameWon = true;
                    restartGame();
                } else {
                    
                    isFlipping = false;
                }
            } else {
                
                setTimeout(() => {
                    card1.style.background = `url('./images/pattern.png') center center / cover no-repeat`;
                    card2.style.background = `url('./images/pattern.png') center center / cover no-repeat`;
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    isFlipping = false; 
                }, 1000);
            }

            openedCards = [];
        }
    }
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function initializeCards() {
    isFirstMove = true; 
    isFlipping = false; 
    matchedPairs = 0; 

    const cardNumbers = Array.from({ length: gridSize * gridSize / 2 }, (_, index) => index + 1);
    const shuffledNumbers = [...cardNumbers, ...cardNumbers];
    shuffleArray(shuffledNumbers);

    const cardsDisplay = document.querySelector('.cardsDisplay');
    cardsDisplay.innerHTML = ''; 

    for (let row = 0; row < gridSize; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('flex');

        for (let col = 0; col < gridSize; col++) {
            const index = row * gridSize + col;
            const number = shuffledNumbers[index];

            const card = document.createElement('div');
            card.classList.add('card', 'cursor-pointer', 'w-20', 'h-20', 'm-1');
            card.dataset.number = number;
            card.style.background = `url('./images/pattern.png') center center / cover no-repeat`;
            card.addEventListener('click', () => flipCard(card));

            rowDiv.appendChild(card);
        }

        cardsDisplay.appendChild(rowDiv);
    }
}


function restartGame() {
    initializeCards();
    isGameStarted = false; 
    isFlipping = false; 
    hasGameWon = false; 
    startTimer();
    matchedPairs = 0;
}

function startGame() {
    initializeCards();
    startTimer();
}

document.querySelectorAll('input[name="difficulty"]').forEach((radioButton) => {
    radioButton.addEventListener('change', handleDifficultyChange);
});

function handleDifficultyChange(event) {
    selectedDifficulty = event.target.value;

    switch (selectedDifficulty) {
        case 'easy':
            gridSize = 4;
            break;
        case 'medium':
            gridSize = 6;
            break;
        case 'hard':
            gridSize = 8;
            break;
        case 'expert':
            gridSize = 10;
            break;
        default:
            break;
    }

    restartGame(); 
}

startGame(); 
showHighScores('easy');
