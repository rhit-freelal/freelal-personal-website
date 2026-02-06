/* ========================================
   FUN.JS - Minigames & Interactive Features
   ======================================== */

// ========================================
// GAME UTILITIES
// ========================================

function openGame(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeGame(modalId) {
    document.getElementById(modalId).classList.remove('active');
    // Clean up any running timers
    if (clickInterval) clearInterval(clickInterval);
    if (typingInterval) clearInterval(typingInterval);
    if (reactionTimeout) clearTimeout(reactionTimeout);
}

// Load best scores from localStorage
function loadBestScores() {
    const bestCPS = localStorage.getItem('bestCPS');
    const bestWPM = localStorage.getItem('bestWPM');
    const bestReaction = localStorage.getItem('bestReaction');
    const bestMemory = localStorage.getItem('bestMemory');

    if (bestCPS) {
        const el = document.getElementById('best-cps');
        if (el) el.textContent = bestCPS + ' CPS';
    }
    if (bestWPM) {
        const el = document.getElementById('best-wpm');
        if (el) el.textContent = bestWPM + ' WPM';
    }
    if (bestReaction) {
        const el = document.getElementById('best-reaction');
        if (el) el.textContent = bestReaction + ' ms';
    }
    if (bestMemory) {
        const el = document.getElementById('best-memory');
        if (el) el.textContent = bestMemory + ' moves';
    }
}

// ========================================
// CLICK SPEED GAME
// ========================================

let clickCount = 0;
let clickGameActive = false;
let clickInterval = null;
let clickTimeLeft = 10;

function startClickGame() {
    openGame('click-game-modal');
    resetClickGame();
}

function resetClickGame() {
    clickCount = 0;
    clickGameActive = false;
    clickTimeLeft = 10;
    document.getElementById('click-count').textContent = '0';
    document.getElementById('click-timer').textContent = '10.0s';
    document.getElementById('click-start-btn').style.display = 'inline-flex';
    document.getElementById('click-start-btn').textContent = 'Start!';
    document.getElementById('click-result').classList.remove('show');
    document.getElementById('click-area').onclick = null;
}

function beginClickTest() {
    clickGameActive = true;
    clickCount = 0;
    clickTimeLeft = 10;
    document.getElementById('click-start-btn').style.display = 'none';
    document.getElementById('click-result').classList.remove('show');

    document.getElementById('click-area').onclick = function() {
        if (clickGameActive) {
            clickCount++;
            document.getElementById('click-count').textContent = clickCount;
        }
    };

    clickInterval = setInterval(() => {
        clickTimeLeft -= 0.1;
        document.getElementById('click-timer').textContent = clickTimeLeft.toFixed(1) + 's';

        if (clickTimeLeft <= 0) {
            endClickGame();
        }
    }, 100);
}

function endClickGame() {
    clearInterval(clickInterval);
    clickGameActive = false;
    document.getElementById('click-area').onclick = null;

    const cps = (clickCount / 10).toFixed(2);
    const resultEl = document.getElementById('click-result');

    let resultHTML = `
        <h3>Results!</h3>
        <p>Total Clicks: <strong>${clickCount}</strong></p>
        <p>Clicks Per Second: <strong>${cps} CPS</strong></p>
        <p>${getClickRating(cps)}</p>
    `;

    // Save best score
    const bestCPS = localStorage.getItem('bestCPS');
    if (!bestCPS || parseFloat(cps) > parseFloat(bestCPS)) {
        localStorage.setItem('bestCPS', cps);
        const bestEl = document.getElementById('best-cps');
        if (bestEl) bestEl.textContent = cps + ' CPS';
        resultHTML += '<p style="color: #10b981; font-weight: bold;">New Personal Best!</p>';
    }

    resultEl.innerHTML = resultHTML;
    resultEl.classList.add('show');

    document.getElementById('click-start-btn').textContent = 'Try Again';
    document.getElementById('click-start-btn').style.display = 'inline-flex';
}

function getClickRating(cps) {
    if (cps >= 12) return 'INSANE! Are you a robot?!';
    if (cps >= 10) return 'Lightning fast!';
    if (cps >= 8) return 'Super speedy!';
    if (cps >= 6) return 'Nice clicking!';
    if (cps >= 4) return 'Good effort!';
    return 'Keep practicing!';
}

// ========================================
// TYPING GAME
// ========================================

const codingWords = [
    'function', 'variable', 'const', 'let', 'return', 'class', 'object', 'array',
    'string', 'number', 'boolean', 'null', 'undefined', 'async', 'await', 'promise',
    'callback', 'loop', 'while', 'for', 'if', 'else', 'switch', 'case', 'break',
    'continue', 'import', 'export', 'module', 'require', 'console', 'log', 'error',
    'debug', 'test', 'component', 'render', 'state', 'props', 'hook', 'effect',
    'context', 'reducer', 'dispatch', 'action', 'store', 'fetch', 'api', 'json',
    'html', 'css', 'javascript', 'python', 'java', 'react', 'node', 'express',
    'database', 'query', 'server', 'client', 'request', 'response', 'header',
    'algorithm', 'data', 'structure', 'tree', 'graph', 'stack', 'queue', 'hash'
];

let typingGameActive = false;
let typingInterval = null;
let typingTimeLeft = 30;
let wordsTyped = 0;
let currentWord = '';

function startTypingGame() {
    openGame('typing-game-modal');
    resetTypingGame();
}

function resetTypingGame() {
    typingGameActive = false;
    typingTimeLeft = 30;
    wordsTyped = 0;
    document.getElementById('words-typed').textContent = '0';
    document.getElementById('typing-timer').textContent = '30s';
    document.getElementById('wpm').textContent = '0';
    document.getElementById('current-word').textContent = 'Press Start';
    document.getElementById('typing-input').value = '';
    document.getElementById('typing-input').disabled = true;
    document.getElementById('typing-start-btn').style.display = 'inline-flex';
    document.getElementById('typing-start-btn').textContent = 'Start!';
    document.getElementById('typing-result').classList.remove('show');
}

function beginTypingTest() {
    typingGameActive = true;
    wordsTyped = 0;
    typingTimeLeft = 30;

    document.getElementById('typing-start-btn').style.display = 'none';
    document.getElementById('typing-result').classList.remove('show');
    document.getElementById('typing-input').disabled = false;
    document.getElementById('typing-input').focus();

    setNewWord();

    document.getElementById('typing-input').oninput = function(e) {
        if (e.target.value.trim().toLowerCase() === currentWord.toLowerCase()) {
            wordsTyped++;
            document.getElementById('words-typed').textContent = wordsTyped;
            e.target.value = '';
            setNewWord();
            updateWPM();
        }
    };

    typingInterval = setInterval(() => {
        typingTimeLeft--;
        document.getElementById('typing-timer').textContent = typingTimeLeft + 's';
        updateWPM();

        if (typingTimeLeft <= 0) {
            endTypingGame();
        }
    }, 1000);
}

function setNewWord() {
    currentWord = codingWords[Math.floor(Math.random() * codingWords.length)];
    document.getElementById('current-word').textContent = currentWord;
}

function updateWPM() {
    const elapsed = 30 - typingTimeLeft;
    if (elapsed > 0) {
        const wpm = Math.round((wordsTyped / elapsed) * 60);
        document.getElementById('wpm').textContent = wpm;
    }
}

function endTypingGame() {
    clearInterval(typingInterval);
    typingGameActive = false;
    document.getElementById('typing-input').disabled = true;

    const wpm = Math.round((wordsTyped / 30) * 60);
    const resultEl = document.getElementById('typing-result');

    let resultHTML = `
        <h3>Results!</h3>
        <p>Words Typed: <strong>${wordsTyped}</strong></p>
        <p>Words Per Minute: <strong>${wpm} WPM</strong></p>
        <p>${getTypingRating(wpm)}</p>
    `;

    // Save best score
    const bestWPM = localStorage.getItem('bestWPM');
    if (!bestWPM || wpm > parseInt(bestWPM)) {
        localStorage.setItem('bestWPM', wpm.toString());
        const bestEl = document.getElementById('best-wpm');
        if (bestEl) bestEl.textContent = wpm + ' WPM';
        resultHTML += '<p style="color: #10b981; font-weight: bold;">New Personal Best!</p>';
    }

    resultEl.innerHTML = resultHTML;
    resultEl.classList.add('show');

    document.getElementById('typing-start-btn').textContent = 'Try Again';
    document.getElementById('typing-start-btn').style.display = 'inline-flex';
}

function getTypingRating(wpm) {
    if (wpm >= 80) return 'Professional typist!';
    if (wpm >= 60) return 'Super fast!';
    if (wpm >= 40) return 'Great speed!';
    if (wpm >= 25) return 'Good job!';
    return 'Keep practicing!';
}

// ========================================
// MEMORY GAME
// ========================================

const memoryIcons = ['🐍', '☕', '⚛️', '🟨', '🦀', '💎', '🐘', '🔷'];
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryMoves = 0;
let canFlip = true;
let memoryStartTime = 0;

function startMemoryGame() {
    openGame('memory-game-modal');
    initMemoryGame();
}

function initMemoryGame() {
    matchedPairs = 0;
    memoryMoves = 0;
    flippedCards = [];
    canFlip = true;
    memoryStartTime = Date.now();

    document.getElementById('memory-moves').textContent = '0';
    document.getElementById('memory-pairs').textContent = '0';
    document.getElementById('memory-result').classList.remove('show');

    // Create pairs
    memoryCards = [...memoryIcons, ...memoryIcons];

    // Shuffle using Fisher-Yates
    for (let i = memoryCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [memoryCards[i], memoryCards[j]] = [memoryCards[j], memoryCards[i]];
    }

    renderMemoryGrid();
}

function renderMemoryGrid() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    memoryCards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.innerHTML = `
            <span class="card-front">${icon}</span>
            <span class="card-back">?</span>
        `;
        card.onclick = () => flipCard(card, index);
        grid.appendChild(card);
    });
}

function flipCard(card, index) {
    if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    card.classList.add('flipped');
    flippedCards.push({ card, index, icon: memoryCards[index] });

    if (flippedCards.length === 2) {
        memoryMoves++;
        document.getElementById('memory-moves').textContent = memoryMoves;
        canFlip = false;

        const [first, second] = flippedCards;

        if (first.icon === second.icon) {
            // Match!
            setTimeout(() => {
                first.card.classList.add('matched');
                second.card.classList.add('matched');
                matchedPairs++;
                document.getElementById('memory-pairs').textContent = matchedPairs;
                flippedCards = [];
                canFlip = true;

                if (matchedPairs === 8) {
                    endMemoryGame();
                }
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                first.card.classList.remove('flipped');
                second.card.classList.remove('flipped');
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }
}

function endMemoryGame() {
    const timeElapsed = Math.round((Date.now() - memoryStartTime) / 1000);
    const resultEl = document.getElementById('memory-result');

    let resultHTML = `
        <h3>You Won!</h3>
        <p>Moves: <strong>${memoryMoves}</strong></p>
        <p>Time: <strong>${timeElapsed}s</strong></p>
        <p>${getMemoryRating(memoryMoves)}</p>
    `;

    // Save best score (fewer moves is better)
    const bestMemory = localStorage.getItem('bestMemory');
    if (!bestMemory || memoryMoves < parseInt(bestMemory)) {
        localStorage.setItem('bestMemory', memoryMoves.toString());
        const bestEl = document.getElementById('best-memory');
        if (bestEl) bestEl.textContent = memoryMoves + ' moves';
        resultHTML += '<p style="color: #10b981; font-weight: bold;">New Personal Best!</p>';
    }

    resultEl.innerHTML = resultHTML;
    resultEl.classList.add('show');
}

function getMemoryRating(moves) {
    if (moves <= 10) return 'Perfect memory!';
    if (moves <= 14) return 'Excellent!';
    if (moves <= 18) return 'Great job!';
    if (moves <= 24) return 'Good effort!';
    return 'Keep practicing!';
}

function resetMemoryGame() {
    initMemoryGame();
}

// ========================================
// REACTION TIME GAME
// ========================================

let reactionState = 'idle'; // idle, waiting, ready
let reactionTimeout = null;
let reactionStartTime = 0;
let reactionTimes = [];

function startReactionGame() {
    openGame('reaction-game-modal');
    resetReactionGame();
}

function resetReactionGame() {
    reactionState = 'idle';
    reactionTimes = [];
    if (reactionTimeout) clearTimeout(reactionTimeout);
    updateReactionBox();
    document.getElementById('reaction-result').classList.remove('show');
    document.getElementById('reaction-history').innerHTML = '';
}

function handleReactionClick() {
    const box = document.getElementById('reaction-box');

    switch (reactionState) {
        case 'idle':
            startReactionRound();
            break;
        case 'waiting':
            // Too early!
            clearTimeout(reactionTimeout);
            reactionState = 'idle';
            box.className = 'reaction-box too-early';
            document.getElementById('reaction-text').textContent = 'Too early! Click to try again';
            break;
        case 'ready':
            // Record time!
            const reactionTime = Date.now() - reactionStartTime;
            reactionTimes.push(reactionTime);
            showReactionResult(reactionTime);
            break;
    }
}

function startReactionRound() {
    const box = document.getElementById('reaction-box');
    reactionState = 'waiting';
    box.className = 'reaction-box waiting';
    document.getElementById('reaction-text').textContent = 'Wait for green...';
    document.getElementById('reaction-result').classList.remove('show');

    const delay = 1000 + Math.random() * 4000; // 1-5 seconds

    reactionTimeout = setTimeout(() => {
        reactionState = 'ready';
        reactionStartTime = Date.now();
        box.className = 'reaction-box ready';
        document.getElementById('reaction-text').textContent = 'CLICK NOW!';
    }, delay);
}

function showReactionResult(time) {
    const box = document.getElementById('reaction-box');
    reactionState = 'idle';
    box.className = 'reaction-box';
    document.getElementById('reaction-text').textContent = `${time}ms - Click to try again`;

    // Add to history
    const history = document.getElementById('reaction-history');
    const timeEl = document.createElement('span');
    timeEl.className = 'reaction-time';
    timeEl.textContent = time + 'ms';
    history.appendChild(timeEl);

    // Show result after 3+ attempts
    if (reactionTimes.length >= 3) {
        const avg = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
        const bestTime = Math.min(...reactionTimes);
        const resultEl = document.getElementById('reaction-result');

        let resultHTML = `
            <p>Best: <strong>${bestTime}ms</strong></p>
            <p>Average: <strong>${avg}ms</strong></p>
            <p>${getReactionRating(avg)}</p>
        `;

        // Save best score (lower is better)
        const storedBest = localStorage.getItem('bestReaction');
        if (!storedBest || bestTime < parseInt(storedBest)) {
            localStorage.setItem('bestReaction', bestTime.toString());
            const bestEl = document.getElementById('best-reaction');
            if (bestEl) bestEl.textContent = bestTime + ' ms';
            resultHTML += '<p style="color: #10b981; font-weight: bold;">New Personal Best!</p>';
        }

        resultEl.innerHTML = resultHTML;
        resultEl.classList.add('show');
    }
}

function updateReactionBox() {
    const box = document.getElementById('reaction-box');
    box.className = 'reaction-box';
    document.getElementById('reaction-text').textContent = 'Click to Start';
}

function getReactionRating(ms) {
    if (ms < 200) return 'Lightning reflexes!';
    if (ms < 250) return 'Super fast!';
    if (ms < 300) return 'Great reactions!';
    if (ms < 400) return 'Good job!';
    return 'Keep practicing!';
}

// ========================================
// FUN FACTS CAROUSEL
// ========================================

let currentFact = 1;
let factInterval = null;

function showFact(num) {
    // Remove active from all
    document.querySelectorAll('.fun-fact').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.fact-dot').forEach(d => d.classList.remove('active'));

    // Add active to selected
    const factEl = document.getElementById(`fact-${num}`);
    const dots = document.querySelectorAll('.fact-dot');

    if (factEl) factEl.classList.add('active');
    if (dots[num - 1]) dots[num - 1].classList.add('active');

    currentFact = num;
}

function startFactCarousel() {
    factInterval = setInterval(() => {
        currentFact = currentFact >= 5 ? 1 : currentFact + 1;
        showFact(currentFact);
    }, 5000);
}

// ========================================
// KONAMI CODE EASTER EGG
// ========================================

const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    // Create and show easter egg message
    const egg = document.createElement('div');
    egg.className = 'easter-egg';
    egg.textContent = 'You found the secret! Go Rose-Hulman!';
    document.body.appendChild(egg);

    // Add confetti effect
    createConfetti();

    setTimeout(() => {
        egg.remove();
    }, 5000);
}

function createConfetti() {
    // Rose-Hulman themed colors
    const colors = ['#800000', '#9B2335', '#c4a4a4', '#ffffff', '#5c0000'];
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            z-index: 10000;
            pointer-events: none;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// INITIALIZE
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadBestScores();
    startFactCarousel();
});
