const I18N = {
    en: {
        title: "Wordle Solver — Free Wordle Answer Helper & Word Finder Tool",
        description: "Free online Wordle Solver tool. Enter your guesses, mark correct and wrong letters, and get smart word recommendations to solve today's Wordle puzzle faster.",
        keywords: "wordle solver, wordle helper, wordle answer, wordle finder, wordle tool, word game solver, 5 letter word finder, daily wordle help, wordle hints, wordle tips",
        subtitle: "Free Wordle helper tool — enter guesses, mark letters, get smart recommendations",
        loadingDict: "Loading dictionary...",
        dictReady: "Dictionary ready: {count} words",
        dictError: "Failed to load dictionary, using fallback",
        mode: "Mode:",
        correct: "Correct",
        wrongPosition: "Wrong Position",
        wrong: "Wrong",
        submit: "Submit",
        undo: "Undo",
        clear: "Clear",
        reset: "Reset",
        bestWords: "Best Words (Score)",
        filterWords: "Filter Words (Elimination)",
        letterStats: "Letter Stats:",
        lettersToTest: "Letters to Test:",
        noMatch: "No matching words",
        checkFlags: "Check your flags",
        enterLetters: "Enter 5 letters first!",
        dictNotLoaded: "Dictionary not loaded!",
        setFlags: "Click tiles to set flags!",
        wordFound: "Word found!",
        allRowsUsed: "All rows used.",
        nextRow: "Row {row}: enter next word",
        wordsMatch: "{count} words match",
        wordsTest: "{test} words to test new letters",
        untested: "Untested",
        needPosition: "Need correct position",
        andMore: "and {count} more",
        templateSTAIR: "STAIR",
        templateLEMON: "LEMON",
        templatePUDGY: "PUDGY",
        ogTitle: "Wordle Solver — Free Wordle Answer Helper & Word Finder Tool",
        ogDescription: "Enter your guesses, mark correct and wrong letters, and get smart word recommendations to solve today's Wordle puzzle faster.",
        noscriptTitle: "Wordle Solver — Free Online Word Game Helper",
        noscriptDesc: "Our free Wordle Solver tool helps you find the best words to solve today's Wordle puzzle. Enter your guesses, mark each letter as correct, wrong position, or wrong, and get intelligent word recommendations based on 14,855 English 5-letter words.",
        howToUse: "How to Use Wordle Solver",
        howToUse1: "Type a 5-letter word or use quick-fill templates (STAIR, LEMON, PUDGY)",
        howToUse2: "Click each tile to mark letter status: green (correct), yellow (wrong position), gray (wrong)",
        howToUse3: "Click Submit to get word recommendations",
        howToUse4: "Repeat until you find the answer",
        features: "Features",
        feat1: "Smart word scoring algorithm",
        feat2: "Letter elimination tracking",
        feat3: "Frequency-based recommendations",
        feat4: "Works offline after first load",
        feat5: "14,855 English words database",
        langLabel: "EN"
    },
    id: {
        title: "Pemecah Wordle — Alat Bantu & Pencari Kata Wordle Gratis",
        description: "Alat Pemecah Wordle online gratis. Masukkan tebakan, tandai huruf benar dan salah, dan dapatkan rekomendasi kata cerdas untuk menyelesaikan puzzle Wordle hari ini lebih cepat.",
        keywords: "pemecah wordle, bantuan wordle, jawaban wordle, pencari kata wordle, alat wordle, pemecah permainan kata, pencari kata 5 huruf, bantuan wordle harian, petunjuk wordle, tips wordle",
        subtitle: "Alat bantu Wordle gratis — masukkan tebakan, tandai huruf, dapatkan rekomendasi cerdas",
        loadingDict: "Memuat kamus...",
        dictReady: "Kamus siap: {count} kata",
        dictError: "Gagal memuat kamus, menggunakan fallback",
        mode: "Mode:",
        correct: "Benar",
        wrongPosition: "Salah Posisi",
        wrong: "Salah",
        submit: "Submit",
        undo: "Undo",
        clear: "Hapus",
        reset: "Reset",
        bestWords: "Kata Terbaik (Skor)",
        filterWords: "Kata Filter (Eliminasi)",
        letterStats: "Statistik Huruf:",
        lettersToTest: "Huruf yang Perlu Diuji:",
        noMatch: "Tidak ada kata cocok",
        checkFlags: "Cek kembali flag Anda",
        enterLetters: "Masukkan 5 huruf terlebih dahulu!",
        dictNotLoaded: "Kamus belum siap!",
        setFlags: "Klik tile untuk set flag!",
        wordFound: "Kata ditemukan!",
        allRowsUsed: "Semua baris terpakai.",
        nextRow: "Baris {row}: masukkan kata berikutnya",
        wordsMatch: "{count} kata sesuai",
        wordsTest: "{test} kata uji huruf baru",
        untested: "Belum diuji",
        needPosition: "Perlu posisi tepat",
        andMore: "dan {count} lainnya",
        templateSTAIR: "STAIR",
        templateLEMON: "LEMON",
        templatePUDGY: "PUDGY",
        ogTitle: "Pemecah Wordle — Alat Bantu & Pencari Kata Wordle Gratis",
        ogDescription: "Masukkan tebakan, tandai huruf benar dan salah, dan dapatkan rekomendasi kata cerdas untuk menyelesaikan puzzle Wordle hari ini lebih cepat.",
        noscriptTitle: "Pemecah Wordle — Alat Bantu Permainan Kata Online Gratis",
        noscriptDesc: "Alat Pemecah Wordle gratis kami membantu Anda menemukan kata terbaik untuk menyelesaikan puzzle Wordle hari ini. Masukkan tebakan, tandai setiap huruf sebagai benar, salah posisi, atau salah, dan dapatkan rekomendasi cerdas berdasarkan 14.855 kata 5 huruf bahasa Inggris.",
        howToUse: "Cara Menggunakan Pemecah Wordle",
        howToUse1: "Ketik kata 5 huruf atau gunakan template cepat (STAIR, LEMON, PUDGY)",
        howToUse2: "Klik setiap tile untuk menandai status huruf: hijau (benar), kuning (salah posisi), abu (salah)",
        howToUse3: "Klik Submit untuk mendapatkan rekomendasi kata",
        howToUse4: "Ulangi sampai kata ditemukan",
        features: "Fitur",
        feat1: "Algoritma skor kata cerdas",
        feat2: "Pelacakan eliminasi huruf",
        feat3: "Rekomendasi berbasis frekuensi",
        feat4: "Bekerja offline setelah muat pertama",
        feat5: "Database 14.855 kata bahasa Inggris",
        langLabel: "ID"
    }
};

let currentLang = localStorage.getItem('wordly-lang') || 'en';

function t(key) {
    return I18N[currentLang]?.[key] || I18N.en[key] || key;
}

function applyTranslations() {
    document.documentElement.lang = currentLang === 'id' ? 'id' : 'en';

    document.title = t('title');

    const setMeta = (name, content, attr = 'name') => {
        const el = document.querySelector(`meta[${attr}="${name}"]`);
        if (el) el.setAttribute('content', content);
    };
    const setProp = (prop, content) => {
        const el = document.querySelector(`meta[property="${prop}"]`);
        if (el) el.setAttribute('content', content);
    };

    setMeta('description', t('description'));
    setMeta('keywords', t('keywords'));
    setProp('og:title', t('ogTitle'));
    setProp('og:description', t('ogDescription'));
    setMeta('twitter:title', t('ogTitle'), 'name');
    setMeta('twitter:description', t('ogDescription'), 'name');

    const ldScript = document.querySelector('script[type="application/ld+json"]');
    if (ldScript) {
        try {
            const data = JSON.parse(ldScript.textContent);
            data.name = currentLang === 'id' ? 'Pemecah Wordle' : 'Wordle Solver';
            data.description = t('description');
            ldScript.textContent = JSON.stringify(data, null, 4);
        } catch (e) {}
    }

    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = currentLang === 'id' ? 'Pemecah Wordle' : 'Wordle Solver';

    const subtitle = document.querySelector('header p');
    if (subtitle) subtitle.textContent = t('subtitle');

    const dictBadge = document.getElementById('dict-badge');
    if (dictBadge && dictBadge.classList.contains('ready')) {
        const count = DictionaryManager?.getWords?.()?.length || 0;
        dictBadge.textContent = t('dictReady').replace('{count}', count.toLocaleString());
    } else if (dictBadge && !dictBadge.classList.contains('loading')) {
        dictBadge.textContent = t('loadingDict');
    }

    const modeLabel = document.querySelector('#mode-selector > span');
    if (modeLabel) modeLabel.textContent = t('mode');

    const modeLabels = document.querySelectorAll('#mode-selector .btn-group label');
    if (modeLabels[0]) modeLabels[0].textContent = t('correct');
    if (modeLabels[1]) modeLabels[1].textContent = t('wrongPosition');
    if (modeLabels[2]) modeLabels[2].textContent = t('wrong');

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.textContent = t('submit');
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) undoBtn.textContent = t('undo');
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) clearBtn.textContent = t('clear');
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.textContent = t('reset');

    const bestHeader = document.querySelector('#best-suggestions').previousElementSibling;
    if (bestHeader) bestHeader.textContent = t('bestWords');
    const filterHeader = document.querySelector('#filter-suggestions').previousElementSibling;
    if (filterHeader) filterHeader.textContent = t('filterWords');

    const statsHeader = document.querySelector('#letter-stats h6');
    if (statsHeader) statsHeader.textContent = t('letterStats');
    const filterHintHeader = document.querySelector('#filter-hints h6');
    if (filterHintHeader) filterHintHeader.textContent = t('lettersToTest');

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.textContent = t('langLabel');

    const templateBtns = document.querySelectorAll('.template-btn');
    const templateWords = [t('templateSTAIR'), t('templateLEMON'), t('templatePUDGY')];
    templateBtns.forEach((btn, i) => {
        if (templateWords[i]) btn.textContent = templateWords[i];
    });
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('wordly-lang', currentLang);
    applyTranslations();
}
