const WordleSolver = (() => {
    const ROWS = 6;
    const COLS = 5;
    const KEYBOARD_ROWS = [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['enter','z','x','c','v','b','n','m','back']
    ];
    const TEMPLATE_WORDS = ['stair', 'lemon', 'pudgy'];

    let board = [];
    let tileStates = [];
    let currentRow = 0;
    let currentCol = 0;
    let possibleWords = [];
    let keyStates = {};
    let guesses = [];

    function init() {
        buildBoard();
        buildKeyboard();
        buildLetterStats();
        buildFilterLetters();
        bindEvents();
        loadDictionary();
        applyTranslations();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('lang') === 'id') {
            currentLang = 'id';
            localStorage.setItem('wordly-lang', 'id');
            applyTranslations();
        }
    }

    function buildBoard() {
        const boardEl = document.getElementById('board');
        boardEl.innerHTML = '';
        board = [];
        tileStates = [];
        guesses = [];

        for (let r = 0; r < ROWS; r++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'board-row-wrapper';

            const row = [];
            const stateRow = [];
            const rowEl = document.createElement('div');
            rowEl.className = 'board-row';

            for (let c = 0; c < COLS; c++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = r;
                tile.dataset.col = c;
                rowEl.appendChild(tile);
                row.push(tile);
                stateRow.push('none');
            }

            wrapper.appendChild(rowEl);

            if (r < TEMPLATE_WORDS.length) {
                const btn = document.createElement('button');
                btn.className = 'template-btn';
                btn.textContent = TEMPLATE_WORDS[r].toUpperCase();
                btn.dataset.row = r;
                btn.addEventListener('click', () => fillTemplate(r));
                wrapper.appendChild(btn);
            } else {
                const spacer = document.createElement('div');
                spacer.className = 'template-spacer';
                wrapper.appendChild(spacer);
            }

            boardEl.appendChild(wrapper);
            board.push(row);
            tileStates.push(stateRow);
            guesses.push('');
        }

        updateCurrentRow();
    }

    function buildKeyboard() {
        const container = document.getElementById('keyboard-container');
        container.innerHTML = '';
        container.className = 'keyboard-container';

        KEYBOARD_ROWS.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'keyboard-row';

            row.forEach(key => {
                const btn = document.createElement('button');
                btn.className = 'key';
                btn.dataset.key = key;

                if (key === 'enter' || key === 'back') {
                    btn.classList.add('wide');
                    btn.textContent = key === 'enter' ? 'Enter' : '\u232B';
                } else {
                    btn.textContent = key.toUpperCase();
                }

                rowEl.appendChild(btn);
            });

            container.appendChild(rowEl);
        });
    }

    function buildLetterStats() {
        const container = document.getElementById('letter-frequency');
        container.innerHTML = '';

        for (const c of 'abcdefghijklmnopqrstuvwxyz') {
            const el = document.createElement('div');
            el.className = 'letter-stat';
            el.textContent = c.toUpperCase();
            el.dataset.letter = c;
            container.appendChild(el);
        }
    }

    function buildFilterLetters() {
        const container = document.getElementById('filter-letters');
        container.innerHTML = '';

        for (const c of 'abcdefghijklmnopqrstuvwxyz') {
            const el = document.createElement('div');
            el.className = 'letter-stat';
            el.textContent = c.toUpperCase();
            el.dataset.letter = c;
            container.appendChild(el);
        }
    }

    function bindEvents() {
        document.addEventListener('keydown', handlePhysicalKeyboard);

        document.getElementById('keyboard-container').addEventListener('click', (e) => {
            const key = e.target.closest('.key');
            if (!key) return;
            handleKeyInput(key.dataset.key);
        });

        document.getElementById('board').addEventListener('click', (e) => {
            const tile = e.target.closest('.tile');
            if (!tile) return;
            const row = parseInt(tile.dataset.row);
            const col = parseInt(tile.dataset.col);
            applyModeToTile(row, col);
        });

        document.getElementById('submit-btn').addEventListener('click', submitGuess);
        document.getElementById('undo-btn').addEventListener('click', undoLetter);
        document.getElementById('clear-btn').addEventListener('click', clearBoard);
        document.getElementById('reset-btn').addEventListener('click', resetGame);

        document.getElementById('best-suggestions').addEventListener('click', (e) => {
            const word = e.target.closest('.suggestion-word');
            if (!word) return;
            fillWord(word.dataset.word);
        });

        document.getElementById('filter-suggestions').addEventListener('click', (e) => {
            const word = e.target.closest('.suggestion-word');
            if (!word) return;
            fillWord(word.dataset.word);
        });
    }

    function handlePhysicalKeyboard(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleKeyInput('enter');
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            handleKeyInput('back');
        } else if (/^[a-zA-Z]$/.test(e.key)) {
            handleKeyInput(e.key.toLowerCase());
        }
    }

    function handleKeyInput(key) {
        if (key === 'enter') {
            submitGuess();
        } else if (key === 'back') {
            undoLetter();
        } else if (/^[a-z]$/.test(key)) {
            addLetter(key);
        }
    }

    function getMode() {
        const checked = document.querySelector('input[name="tileMode"]:checked');
        return checked ? checked.value : 'absent';
    }

    function addLetter(letter) {
        updateCurrentRow();
        if (currentCol >= COLS) return;

        const tile = board[currentRow][currentCol];
        tile.textContent = letter.toUpperCase();
        tile.classList.add('filled');
        guesses[currentRow] = getRowWord(currentRow);
        currentCol++;
    }

    function undoLetter() {
        updateCurrentRow();
        if (currentCol <= 0) return;
        currentCol--;
        const tile = board[currentRow][currentCol];
        tile.textContent = '';
        tile.classList.remove('filled');
        guesses[currentRow] = getRowWord(currentRow);
    }

    function applyModeToTile(row, col) {
        const mode = getMode();
        tileStates[row][col] = mode;

        const tile = board[row][col];
        tile.classList.remove('correct', 'present', 'absent');
        tile.classList.add(mode);

        const letter = tile.textContent.toLowerCase();
        if (letter) {
            updateKeyState(letter, mode);
        }

        recalculate();
    }

    function updateKeyState(letter, state) {
        const priority = { 'correct': 3, 'present': 2, 'absent': 1 };
        const current = keyStates[letter];

        if (!current || priority[state] > priority[current]) {
            keyStates[letter] = state;
        }

        const keyEl = document.querySelector(`.key[data-key="${letter}"]`);
        if (keyEl) {
            keyEl.classList.remove('correct', 'present', 'absent');
            if (keyStates[letter]) {
                keyEl.classList.add(keyStates[letter]);
            }
        }
    }

    function updateCurrentRow() {
        for (let r = 0; r < ROWS; r++) {
            if (guesses[r].length < COLS) {
                currentRow = r;
                currentCol = guesses[r].length;
                return;
            }
        }
        currentRow = ROWS - 1;
        currentCol = COLS;
    }

    function getRowWord(row) {
        return board[row].map(t => t.textContent).join('').toLowerCase();
    }

    function fillTemplate(row) {
        const word = TEMPLATE_WORDS[row];
        for (let i = 0; i < COLS; i++) {
            board[row][i].textContent = word[i].toUpperCase();
            board[row][i].classList.add('filled', 'absent');
            tileStates[row][i] = 'absent';
        }
        guesses[row] = word;

        const btn = document.querySelector(`.template-btn[data-row="${row}"]`);
        if (btn) btn.classList.add('filled');

        updateCurrentRow();
        recalculate();
    }

    function fillWord(word) {
        updateCurrentRow();
        if (currentCol !== 0) return;

        for (let i = 0; i < COLS; i++) {
            board[currentRow][i].textContent = word[i].toUpperCase();
            board[currentRow][i].classList.add('filled');
        }
        guesses[currentRow] = word;
        currentCol = COLS;
    }

    function submitGuess() {
        updateCurrentRow();
        if (currentCol < COLS) {
            showMessage(t('enterLetters'), 'warning');
            return;
        }

        const guess = getRowWord(currentRow);
        guesses[currentRow] = guess;

        if (!DictionaryManager.isLoaded()) {
            showMessage(t('dictNotLoaded'), 'warning');
            return;
        }

        const hasFlags = tileStates[currentRow].some(s => s !== 'none');
        if (!hasFlags) {
            showMessage(t('setFlags'), 'warning');
            return;
        }

        if (tileStates[currentRow].every(s => s === 'correct')) {
            showMessage(t('wordFound'), 'success');
            recalculate();
            return;
        }

        if (currentRow >= ROWS - 1) {
            showMessage(t('allRowsUsed'), 'danger');
            recalculate();
            return;
        }

        currentRow++;
        updateCurrentRow();
        showMessage(t('nextRow').replace('{row}', currentRow + 1), 'info');
    }

    function recalculate() {
        possibleWords = DictionaryManager.getWords().slice();

        for (let row = 0; row < ROWS; row++) {
            const guess = getRowWord(row);
            if (guess.length < COLS) continue;

            const correctPositions = {};
            const presentLetters = {};
            const absentLetters = new Set();

            for (let i = 0; i < COLS; i++) {
                const letter = guess[i];
                const state = tileStates[row][i];
                if (state === 'correct') {
                    correctPositions[i] = letter;
                } else if (state === 'present') {
                    if (!presentLetters[letter]) presentLetters[letter] = [];
                    presentLetters[letter].push(i);
                } else if (state === 'absent') {
                    absentLetters.add(letter);
                }
            }

            if (!Object.keys(correctPositions).length && !Object.keys(presentLetters).length && !absentLetters.size) continue;

            possibleWords = possibleWords.filter(word => {
                for (const [pos, letter] of Object.entries(correctPositions)) {
                    if (word[pos] !== letter) return false;
                }

                for (const [letter, badPositions] of Object.entries(presentLetters)) {
                    if (!word.includes(letter)) return false;
                    for (const pos of badPositions) {
                        if (word[pos] === letter) return false;
                    }
                }

                for (const letter of absentLetters) {
                    const isCorrect = Object.values(correctPositions).includes(letter);
                    const isPresent = presentLetters[letter];
                    if (!isCorrect && !isPresent) {
                        if (word.includes(letter)) return false;
                    } else {
                        const correctCount = Object.values(correctPositions).filter(l => l === letter).length;
                        const presentCount = presentLetters[letter] ? presentLetters[letter].length : 0;
                        if (word.split('').filter(c => c === letter).length < correctCount + presentCount) return false;
                    }
                }

                return true;
            });
        }

        updateLetterStats();
        updateFilterHints();
        updateRecommendations();
    }

    function updateRecommendations() {
        const bestContainer = document.getElementById('best-suggestions');
        const filterContainer = document.getElementById('filter-suggestions');
        const countLabel = document.getElementById('word-count');

        bestContainer.innerHTML = '';
        filterContainer.innerHTML = '';

        if (!possibleWords.length) {
            bestContainer.innerHTML = `<p class="text-danger small">${t('noMatch')}</p>`;
            filterContainer.innerHTML = `<p class="text-danger small">${t('checkFlags')}</p>`;
            countLabel.textContent = '';
            return;
        }

        const usedLetters = new Set();
        for (const guess of guesses) {
            for (const c of guess) usedLetters.add(c);
        }

        const letterFreq = {};
        for (const word of possibleWords) {
            for (const c of new Set(word)) {
                letterFreq[c] = (letterFreq[c] || 0) + 1;
            }
        }

        const scored = possibleWords.map(word => {
            let score = 0, freqScore = 0;
            const seen = new Set();
            for (const c of word) {
                if (!seen.has(c)) {
                    if (keyStates[c] === 'correct' || keyStates[c] === 'present') score += 10;
                    else if (keyStates[c] === undefined) score += 1;
                    freqScore += letterFreq[c] || 0;
                    seen.add(c);
                }
            }
            return { word, score, freqScore };
        });

        scored.sort((a, b) => b.score - a.score || b.freqScore - a.freqScore || a.word.localeCompare(b.word));

        scored.slice(0, 50).forEach(({ word }) => {
            const el = document.createElement('span');
            el.className = 'suggestion-word';
            el.textContent = word;
            el.dataset.word = word;
            bestContainer.appendChild(el);
        });

        const correctPositions = {};
        for (let row = 0; row < ROWS; row++) {
            const guess = getRowWord(row);
            if (guess.length < COLS) continue;
            for (let i = 0; i < COLS; i++) {
                if (tileStates[row][i] === 'correct') {
                    correctPositions[i] = guess[i];
                }
            }
        }

        const untestedFreq = {};
        for (const word of possibleWords) {
            for (const c of new Set(word)) {
                if (!usedLetters.has(c)) {
                    untestedFreq[c] = (untestedFreq[c] || 0) + 1;
                }
            }
        }

        const allWords = DictionaryManager.getWords();
        const filterCandidates = allWords
            .filter(word => {
                for (const [pos, letter] of Object.entries(correctPositions)) {
                    if (word[pos] !== letter) return false;
                }
                return !guesses.includes(word);
            })
            .map(word => {
                let elimScore = 0;
                const newLetters = new Set();
                for (const c of word) {
                    if (!usedLetters.has(c) && !newLetters.has(c)) {
                        elimScore += untestedFreq[c] || 0;
                        newLetters.add(c);
                    }
                }
                return { word, elimScore, newCount: newLetters.size };
            })
            .filter(c => c.newCount > 0)
            .sort((a, b) => b.elimScore - a.elimScore || b.newCount - a.newCount || a.word.localeCompare(b.word));

        filterCandidates.slice(0, 50).forEach(({ word, elimScore }) => {
            const el = document.createElement('span');
            el.className = 'suggestion-word filter-word';
            el.textContent = word;
            el.dataset.word = word;
            el.title = `Eliminasi: ${elimScore}`;
            filterContainer.appendChild(el);
        });

        countLabel.textContent = `${t('wordsMatch').replace('{count}', scored.length)} | ${t('wordsTest').replace('{test}', filterCandidates.length)}`;
    }

    function updateLetterStats() {
        const container = document.getElementById('letter-frequency');
        const els = container.querySelectorAll('.letter-stat');

        els.forEach(el => {
            const c = el.dataset.letter;
            const state = keyStates[c];
            el.className = 'letter-stat';

            if (state === 'correct' || state === 'present') {
                el.classList.add('likely');
            } else if (state === 'absent') {
                el.classList.add('unlikely');
            } else if (possibleWords.length) {
                const freq = possibleWords.filter(w => w.includes(c)).length;
                const ratio = freq / possibleWords.length;
                if (ratio > 0.4) el.classList.add('possible');
            }
        });
    }

    function updateFilterHints() {
        const container = document.getElementById('filter-letters');
        const els = container.querySelectorAll('.letter-stat');
        const infoEl = document.getElementById('filter-info');

        const usedLetters = new Set();
        const knownLetters = new Set();
        const absentLettersSet = new Set();

        for (let row = 0; row < ROWS; row++) {
            const guess = getRowWord(row);
            if (guess.length < COLS) continue;
            for (let i = 0; i < COLS; i++) {
                usedLetters.add(guess[i]);
                const state = tileStates[row][i];
                if (state === 'correct' || state === 'present') knownLetters.add(guess[i]);
                else if (state === 'absent') absentLettersSet.add(guess[i]);
            }
        }

        els.forEach(el => {
            const c = el.dataset.letter;
            el.className = 'letter-stat';

            if (knownLetters.has(c)) {
                el.classList.add('likely');
            } else if (absentLettersSet.has(c)) {
                el.classList.add('unlikely');
            } else if (possibleWords.length) {
                const freq = possibleWords.filter(w => w.includes(c)).length;
                const ratio = freq / possibleWords.length;
                if (ratio > 0.5) el.classList.add('possible');
                else if (ratio > 0.2) el.classList.add('low');
                else el.classList.add('very-low');
            }
        });

        const untested = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !usedLetters.has(c));
        const presentInWord = [...knownLetters].filter(c => keyStates[c] === 'present');

        const parts = [];
        if (untested.length) parts.push(`${t('untested')}: ${untested.slice(0, 13).join(' ')}`);
        if (presentInWord.length) parts.push(`${t('needPosition')}: ${presentInWord.sort().join(', ')}`);

        infoEl.textContent = parts.join(' | ');
    }

    function showMessage(text, type) {
        const msgEl = document.getElementById('message');
        msgEl.textContent = text;
        msgEl.className = `alert alert-${type}`;
        msgEl.classList.remove('d-none');
        setTimeout(() => { msgEl.classList.add('d-none'); }, 3000);
    }

    function clearBoard() {
        currentRow = 0;
        currentCol = 0;
        tileStates = Array.from({ length: ROWS }, () => Array(COLS).fill('none'));
        keyStates = {};
        possibleWords = DictionaryManager.getWords().slice();
        guesses = Array(ROWS).fill('');

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                board[r][c].textContent = '';
                board[r][c].className = 'tile';
            }
        }

        document.querySelectorAll('.key').forEach(k => k.classList.remove('correct', 'present', 'absent'));
        document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('filled'));

        document.getElementById('best-suggestions').innerHTML = '';
        document.getElementById('filter-suggestions').innerHTML = '';
        document.getElementById('word-count').textContent = '';
        document.getElementById('message').classList.add('d-none');
        document.getElementById('filter-info').textContent = '';

        updateLetterStats();
        updateFilterHints();
        updateRecommendations();
    }

    function resetGame() {
        clearBoard();
    }

    async function loadDictionary() {
        const badge = document.getElementById('dict-badge');
        badge.textContent = t('loadingDict');
        badge.className = 'badge loading';

        try {
            await DictionaryManager.loadDictionary();
            const count = DictionaryManager.getWords().length;
            badge.textContent = t('dictReady').replace('{count}', count.toLocaleString());
            badge.className = 'badge ready';
            possibleWords = DictionaryManager.getWords().slice();
            updateRecommendations();
        } catch (e) {
            badge.textContent = t('dictError');
            badge.className = 'badge error';
        }
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    WordleSolver.init();
});
