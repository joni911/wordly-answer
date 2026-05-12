const WordleSolver = (() => {
    const ROWS = 6;
    const COLS = 5;
    const DEFAULT_TEMPLATES = ['stair', 'lemon', 'pudgy'];

    function getTemplates() {
        try {
            const saved = localStorage.getItem('wordly-templates');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length === 3 && parsed.every(w => typeof w === 'string' && w.length === 5)) {
                    return parsed.map(w => w.toLowerCase());
                }
            }
        } catch (e) {}
        return DEFAULT_TEMPLATES.slice();
    }

    function setTemplates(templates) {
        localStorage.setItem('wordly-templates', JSON.stringify(templates));
    }

    let board = [];
    let tileStates = [];
    let possibleWords = [];
    let keyStates = {};
    let guesses = [];

    function init() {
        buildBoard();
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

            const templates = getTemplates();
            if (r < templates.length) {
                const btn = document.createElement('button');
                btn.className = 'template-btn';
                btn.textContent = templates[r].toUpperCase();
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
        // Word input
        const wordInput = document.getElementById('word-input');
        const sendBtn = document.getElementById('send-btn');

        sendBtn.addEventListener('click', () => {
            sendWord(wordInput.value);
        });

        wordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendWord(wordInput.value);
            }
        });

        wordInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
        });

        // Board tile click → change color only
        document.getElementById('board').addEventListener('click', (e) => {
            const tile = e.target.closest('.tile');
            if (!tile) return;
            const row = parseInt(tile.dataset.row);
            const col = parseInt(tile.dataset.col);
            if (tile.textContent.trim()) {
                applyModeToTile(row, col);
            }
        });

        // Controls
        document.getElementById('undo-btn').addEventListener('click', undoLastLetter);
        document.getElementById('clear-btn').addEventListener('click', clearLastRow);
        document.getElementById('reset-btn').addEventListener('click', resetGame);
        document.getElementById('edit-template-btn').addEventListener('click', editTemplates);

        // Suggestions click → fill word to first empty row
        document.getElementById('best-suggestions').addEventListener('click', (e) => {
            const word = e.target.closest('.suggestion-word');
            if (!word) return;
            fillWordToFirstEmptyRow(word.dataset.word);
        });

        document.getElementById('filter-suggestions').addEventListener('click', (e) => {
            const word = e.target.closest('.suggestion-word');
            if (!word) return;
            fillWordToFirstEmptyRow(word.dataset.word);
        });

        // Template modal
        const templateModal = document.getElementById('template-modal');
        document.getElementById('template-cancel-btn').addEventListener('click', closeTemplateModal);
        document.getElementById('template-save-btn').addEventListener('click', saveTemplateEdit);
        templateModal.addEventListener('click', (e) => {
            if (e.target === templateModal) closeTemplateModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isModalOpen()) {
                closeTemplateModal();
            }
        });

        document.querySelectorAll('#template-modal .template-input').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
                document.getElementById('template-error').classList.add('d-none');
            });
        });
    }

    function sendWord(val) {
        const word = val.trim().toLowerCase();
        if (word.length !== 5 || !/^[a-z]+$/.test(word)) {
            showMessage('Please enter a valid 5-letter word (a-z)', 'warning');
            return;
        }

        // Find first empty row
        let targetRow = -1;
        for (let r = 0; r < ROWS; r++) {
            if (guesses[r].length === 0) {
                targetRow = r;
                break;
            }
        }

        if (targetRow === -1) {
            showMessage('All rows are full. Clear a row or reset.', 'warning');
            return;
        }

        fillRow(targetRow, word);
        document.getElementById('word-input').value = '';
        document.getElementById('word-input').focus();
    }

    function fillRow(row, word) {
        for (let i = 0; i < COLS; i++) {
            const tile = board[row][i];
            tile.textContent = word[i].toUpperCase();
            tile.classList.add('filled', 'absent');
            tileStates[row][i] = 'absent';
            updateKeyState(word[i], 'absent');
        }
        guesses[row] = word;

        const btn = document.querySelector(`.template-btn[data-row="${row}"]`);
        if (btn) btn.classList.add('filled');

        recalculate();
    }

    function fillWordToFirstEmptyRow(word) {
        let targetRow = -1;
        for (let r = 0; r < ROWS; r++) {
            if (guesses[r].length === 0) {
                targetRow = r;
                break;
            }
        }
        if (targetRow === -1) {
            showMessage('All rows are full.', 'warning');
            return;
        }
        fillRow(targetRow, word);
    }

    function fillTemplate(row) {
        const templates = getTemplates();
        const word = templates[row];
        fillRow(row, word);
    }

    function undoLastLetter() {
        // Find the last filled tile (bottom-right most)
        let lastRow = -1, lastCol = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (guesses[r].length === 0) continue;
            for (let c = COLS - 1; c >= 0; c--) {
                if (board[r][c].textContent.trim()) {
                    lastRow = r;
                    lastCol = c;
                    break;
                }
            }
            if (lastRow !== -1) break;
        }

        if (lastRow === -1) {
            showMessage('Nothing to undo', 'info');
            return;
        }

        const tile = board[lastRow][lastCol];
        const letter = tile.textContent.toLowerCase();
        tile.textContent = '';
        tile.classList.remove('filled', 'correct', 'present', 'absent');
        tileStates[lastRow][lastCol] = 'none';

        // Rebuild guess string
        guesses[lastRow] = getRowWord(lastRow);

        // If row is now empty, remove filled class from template btn
        if (guesses[lastRow].length === 0) {
            const btn = document.querySelector(`.template-btn[data-row="${lastRow}"]`);
            if (btn) btn.classList.remove('filled');
        }

        // Recalculate key states for this letter
        recalcKeyStates();
        recalculate();
    }

    function clearLastRow() {
        // Find the bottom-most row that has text
        let targetRow = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (guesses[r].length > 0) {
                targetRow = r;
                break;
            }
        }

        if (targetRow === -1) {
            showMessage('No rows to clear', 'info');
            return;
        }

        for (let c = 0; c < COLS; c++) {
            const tile = board[targetRow][c];
            tile.textContent = '';
            tile.classList.remove('filled', 'correct', 'present', 'absent');
            tileStates[targetRow][c] = 'none';
        }
        guesses[targetRow] = '';

        const btn = document.querySelector(`.template-btn[data-row="${targetRow}"]`);
        if (btn) btn.classList.remove('filled');

        recalcKeyStates();
        recalculate();
    }

    function recalcKeyStates() {
        keyStates = {};
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const letter = board[r][c].textContent.toLowerCase();
                const state = tileStates[r][c];
                if (letter && state !== 'none') {
                    updateKeyState(letter, state);
                }
            }
        }
        document.querySelectorAll('.key').forEach(k => k.classList.remove('correct', 'present', 'absent'));
        for (const [letter, state] of Object.entries(keyStates)) {
            const keyEl = document.querySelector(`.key[data-key="${letter}"]`);
            if (keyEl) keyEl.classList.add(state);
        }
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

    function getMode() {
        const checked = document.querySelector('input[name="tileMode"]:checked');
        return checked ? checked.value : 'absent';
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

    function getRowWord(row) {
        return board[row].map(t => t.textContent).join('').toLowerCase();
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

    function resetGame() {
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

        document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('filled'));

        document.getElementById('best-suggestions').innerHTML = '';
        document.getElementById('filter-suggestions').innerHTML = '';
        document.getElementById('word-count').textContent = '';
        document.getElementById('message').classList.add('d-none');
        document.getElementById('filter-info').textContent = '';
        document.getElementById('word-input').value = '';

        updateLetterStats();
        updateFilterHints();
        updateRecommendations();
    }

    function updateTemplateButtons() {
        const templates = getTemplates();
        document.querySelectorAll('.template-btn').forEach((btn, i) => {
            if (templates[i]) {
                btn.textContent = templates[i].toUpperCase();
            }
        });
    }

    function editTemplates() {
        const templates = getTemplates();
        const inputs = document.querySelectorAll('#template-modal .template-input');
        inputs.forEach((input, i) => {
            input.value = templates[i] ? templates[i].toUpperCase() : '';
        });
        document.getElementById('template-error').classList.add('d-none');
        document.getElementById('template-modal').classList.add('show');
    }

    function closeTemplateModal() {
        document.getElementById('template-modal').classList.remove('show');
        document.getElementById('template-error').classList.add('d-none');
    }

    function isModalOpen() {
        const modal = document.getElementById('template-modal');
        return modal && modal.classList.contains('show');
    }

    function saveTemplateEdit() {
        const inputs = document.querySelectorAll('#template-modal .template-input');
        const newTemplates = [];
        for (let i = 0; i < inputs.length; i++) {
            const val = inputs[i].value.trim().toLowerCase();
            if (val.length !== 5 || !/^[a-z]+$/.test(val)) {
                const err = document.getElementById('template-error');
                err.textContent = `Template ${i + 1} must be exactly 5 letters (a-z). Current: "${inputs[i].value}"`;
                err.classList.remove('d-none');
                return;
            }
            newTemplates.push(val);
        }
        setTemplates(newTemplates);
        closeTemplateModal();
        updateTemplateButtons();
        showMessage('Templates saved successfully', 'success');
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
