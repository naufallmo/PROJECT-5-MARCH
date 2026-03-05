const SCREENS = ['start','ch1','game1','game2','game3','ch3','game4','pass','letter','final'];
let currentScreen = 0;

/* -------- Memory -------- */
let mem = {};

/* -------- Word Scramble -------- */
const WORD_LIST = ['YOU','ARE','PERFECT'];
let word = {};

/* -------- Wordle -------- */
const WORDLE_WORDS   = ['CINTA','SASHA','TIBOO'];
const KEYBOARD_LAYOUT = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫']
];
let wordle = {};

let wordleTransitioning = false;   
let letterOpened        = false;   

/* =========== NAVIGATION =========== */
function next(id) {
  stopMemTimer();
  stopWordTimer();

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add('active');
  currentScreen = SCREENS.indexOf(id);
  updateProgress();
  window.scrollTo(0, 0);

  if (id === 'game1') initMemory();
  if (id === 'game2') initWord();
  if (id === 'game3') initWordle();
  if (id === 'game4') initRating();
}

function updateProgress() {
  const pct = (currentScreen / (SCREENS.length - 1)) * 100;
  document.getElementById('progress').style.width = pct + '%';
}

function startStory() {
  const music = document.getElementById('bgm');
  if (music) music.play().catch(() => {});
  next('ch1');
}

/* ========= MEMORY GAME ========= */
function initMemory() {
  stopMemTimer();

  const emojis = ['💕','💐','💘','💯','📸','🎵','🚂','🫶'];
  const cards  = shuffle([...emojis, ...emojis]);

  mem = { cards, flipped: [], matched: 0, moves: 0, time: 0, timer: null, busy: false };

  document.getElementById('match').textContent = '0/8';
  document.getElementById('move').textContent  = '0';
  document.getElementById('time').textContent  = '0s';
  document.getElementById('mem-next').classList.add('hide');

  const grid = document.getElementById('memory');
  grid.innerHTML = '';

  cards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;
    card.innerHTML =
      '<span class="back">❓</span>' +
      '<span class="front hide">' + emoji + '</span>';
    card.addEventListener('click', () => flipCard(card, i, emoji));
    grid.appendChild(card);
  });

  startMemTimer();
}

function flipCard(card, i, emoji) {
  // Prevent: busy animating, already flipped, already matched
  if (mem.busy) return;
  if (card.classList.contains('flip') || card.classList.contains('match')) return;
  if (mem.flipped.length >= 2) return;

  card.classList.add('flip');
  card.querySelector('.back').classList.add('hide');
  card.querySelector('.front').classList.remove('hide');
  mem.flipped.push({ card, i, emoji });

  if (mem.flipped.length === 2) {
    mem.busy = true;
    mem.moves++;
    document.getElementById('move').textContent = mem.moves;
    checkMemMatch();
  }
}

function checkMemMatch() {
  const [a, b] = mem.flipped;

  if (a.emoji === b.emoji && a.i !== b.i) {
    setTimeout(() => {
      a.card.classList.add('match');
      b.card.classList.add('match');
      mem.flipped = [];
      mem.matched++;
      mem.busy = false;
      document.getElementById('match').textContent = mem.matched + '/8';

      if (mem.matched === 8) {
        stopMemTimer();
        setTimeout(() => {
          alert('🎉 Selesai! Moves: ' + mem.moves + ', Time: ' + mem.time + 's');
          document.getElementById('mem-next').classList.remove('hide');
        }, 400);
      }
    }, 400);
  } else {
    setTimeout(() => {
      [a, b].forEach(({ card }) => {
        card.classList.remove('flip');
        card.querySelector('.back').classList.remove('hide');
        card.querySelector('.front').classList.add('hide');
      });
      mem.flipped = [];
      mem.busy = false;
    }, 900);
  }
}

function startMemTimer() {
  mem.timer = setInterval(() => {
    mem.time++;
    document.getElementById('time').textContent = mem.time + 's';
  }, 1000);
}

function stopMemTimer() {
  if (mem.timer) { clearInterval(mem.timer); mem.timer = null; }
}

/* =========== WORD SCRAMBLE ========== */
   function initWord() {
  stopWordTimer();

  word = {
    words   : [...WORD_LIST],
    current : 0,
    score   : 0,
    time    : 30,
    timer   : null,
    done    : false
  };

  document.getElementById('w-input').classList.remove('hide');
  document.getElementById('w-check-btn').classList.remove('hide');
  document.getElementById('scramble').classList.remove('hide');
  document.querySelector('.word-info').classList.remove('hide');
  document.getElementById('w-score').classList.add('hide');
  document.getElementById('w-next').classList.add('hide');
  document.getElementById('w-feed').className = 'hide';

  loadWordRound();
}

function loadWordRound() {
  if (word.current >= word.words.length) {
    showWordScore();
    return;
  }

  document.getElementById('w-round').textContent = word.current + 1;
  const original  = word.words[word.current];
  const scrambled = shuffleWord(original);
  document.getElementById('scramble').textContent = scrambled;
  document.getElementById('w-input').value = '';
  document.getElementById('w-input').focus();
  document.getElementById('w-feed').className = 'hide';

  word.time = 30;
  document.getElementById('w-timer').textContent = word.time + 's';

  stopWordTimer();
  word.timer = setInterval(() => {
    word.time--;
    document.getElementById('w-timer').textContent = word.time + 's';
    if (word.time <= 0) {
      stopWordTimer();
      showWordFeedback(false, 'Waktu habis! Jawaban: ' + original);
      word.current++;
      setTimeout(loadWordRound, 1800);
    }
  }, 1000);
}

function checkWord() {
  if (word.done) return;
  const input   = document.getElementById('w-input').value.toUpperCase().trim();
  const correct = word.words[word.current];

  stopWordTimer();

  if (input === correct) {
    word.score++;
    showWordFeedback(true, '✓ Benar!');
  } else {
    showWordFeedback(false, '✗ Salah! Jawaban: ' + correct);
  }

  word.current++;
  setTimeout(loadWordRound, 1800);
}

function showWordFeedback(ok, msg) {
  const feed = document.getElementById('w-feed');
  feed.textContent = msg;
  feed.className   = ok ? 'ok' : 'no';
}

function showWordScore() {
  stopWordTimer();
  word.done = true;

  document.getElementById('w-input').classList.add('hide');
  document.getElementById('w-check-btn').classList.add('hide');
  document.getElementById('scramble').classList.add('hide');
  document.querySelector('.word-info').classList.add('hide');
  document.getElementById('w-feed').className = 'hide';

  document.getElementById('w-final').textContent = word.score;
  const msgs = ['😅 Lumayan! Coba lagi nanti ya!', '😊 Bagus! Good job!', '😊 Bagus! Good job!', '🎉 Perfect! Kamu hebat!'];
  document.getElementById('w-msg').textContent = msgs[word.score] || msgs[0];
  document.getElementById('w-score').classList.remove('hide');
  document.getElementById('w-next').classList.remove('hide');
}

function stopWordTimer() {
  if (word.timer) { clearInterval(word.timer); word.timer = null; }
}

/* ========= WORDLE ========== */
function initWordle() {
  wordleTransitioning = false;
  wordle = {
    words       : [...WORDLE_WORDS],
    current     : 0,
    attempts    : 0,
    maxAttempts : 6,
    currentGuess: '',
    guesses     : [],
    keyboard    : {}
  };
  document.getElementById('wordle-next').classList.add('hide');
  document.getElementById('wordle-msg').className = 'hide';
  document.getElementById('wordle-msg').textContent = '';
  loadWordleRound();
}

function loadWordleRound() {
  if (wordle.current >= wordle.words.length) {
    const msg = document.getElementById('wordle-msg');
    msg.textContent = '🎉 Semua kata berhasil ditebak!';
    msg.className = 'win';
    document.getElementById('wordle-next').classList.remove('hide');
    return;
  }

  wordle.attempts     = 0;
  wordle.currentGuess = '';
  wordle.guesses      = [];
  wordle.keyboard     = {};
  wordleTransitioning = false;

  document.getElementById('wordle-round').textContent   = wordle.current + 1;
  document.getElementById('wordle-attempt').textContent = wordle.maxAttempts;
  document.getElementById('wordle-msg').className       = 'hide';
  document.getElementById('wordle-msg').textContent     = '';

  const targetLen = wordle.words[wordle.current].length;
  createWordleGrid(targetLen);
  createWordleKeyboard();
}

function createWordleGrid(wordLength) {
  const grid = document.getElementById('wordle-grid');
  grid.innerHTML = '';

  for (let i = 0; i < wordle.maxAttempts; i++) {
    const row = document.createElement('div');
    row.className = 'wordle-row' + (wordLength === 6 ? ' six' : '');
    row.id = 'wordle-row-' + i;

    for (let j = 0; j < wordLength; j++) {
      const cell = document.createElement('div');
      cell.className = 'wordle-cell';
      cell.id = 'cell-' + i + '-' + j;
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

function createWordleKeyboard() {
  const keyboard = document.getElementById('wordle-keyboard');
  keyboard.innerHTML = '';

  KEYBOARD_LAYOUT.forEach(rowKeys => {
    const rowEl = document.createElement('div');
    rowEl.className = 'wordle-keyboard-row';

    rowKeys.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'wordle-key' + (key.length > 1 ? ' wide' : '');
      btn.textContent = key;
      btn.id = 'key-' + key;
      btn.addEventListener('click', () => handleWordleKey(key));
      rowEl.appendChild(btn);
    });

    keyboard.appendChild(rowEl);
  });
}

function handleWordleKey(key) {
  if (wordleTransitioning) return;

  const target = wordle.words[wordle.current];

  if (key === 'ENTER') {
    if (wordle.currentGuess.length === target.length) {
      submitWordleGuess();
    }
  } else if (key === '⌫') {
    wordle.currentGuess = wordle.currentGuess.slice(0, -1);
    updateWordleDisplay();
  } else if (wordle.currentGuess.length < target.length) {
    wordle.currentGuess += key;
    updateWordleDisplay();
  }
}

function updateWordleDisplay() {
  const target = wordle.words[wordle.current];
  const row    = document.getElementById('wordle-row-' + wordle.attempts);
  if (!row) return;

  for (let i = 0; i < target.length; i++) {
    row.children[i].textContent = wordle.currentGuess[i] || '';
  }
}

function submitWordleGuess() {
  const target = wordle.words[wordle.current];
  const guess  = wordle.currentGuess;
  const row    = document.getElementById('wordle-row-' + wordle.attempts);

  const result       = new Array(guess.length).fill('absent');
  const targetCopy   = target.split('');
  const guessCopy    = guess.split('');

  for (let i = 0; i < guess.length; i++) {
    if (guessCopy[i] === targetCopy[i]) {
      result[i]    = 'correct';
      targetCopy[i] = null;
      guessCopy[i]  = null;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    const idx = targetCopy.indexOf(guessCopy[i]);
    if (idx !== -1) {
      result[i]    = 'present';
      targetCopy[idx] = null;
    }
  }

  // Animate cells
  for (let i = 0; i < guess.length; i++) {
    const cell = row.children[i];
    setTimeout(() => cell.classList.add(result[i]), i * 100);

    const letter  = guess[i];
    const current = wordle.keyboard[letter];
    if (!current || current === 'absent' || (current === 'present' && result[i] === 'correct')) {
      wordle.keyboard[letter] = result[i];
      const keyBtn = document.getElementById('key-' + letter);
      if (keyBtn) {
        keyBtn.classList.remove('correct','present','absent');
        keyBtn.classList.add(result[i]);
      }
    }
  }

  wordle.guesses.push(guess);
  wordle.attempts++;
  wordle.currentGuess = '';

  document.getElementById('wordle-attempt').textContent = wordle.maxAttempts - wordle.attempts;

  const animDelay = guess.length * 100 + 150;

  if (guess === target) {
    wordleTransitioning = true;
    setTimeout(() => {
      const msg = document.getElementById('wordle-msg');
      msg.textContent = '✓ Benar! Kata: ' + target;
      msg.className   = 'win';
      setTimeout(() => {
        wordle.current++;
        loadWordleRound();
      }, 1800);
    }, animDelay);
  } else if (wordle.attempts >= wordle.maxAttempts) {
    wordleTransitioning = true;
    setTimeout(() => {
      const msg = document.getElementById('wordle-msg');
      msg.textContent = '✗ Kata yang benar: ' + target;
      msg.className   = 'lose';
      setTimeout(() => {
        wordle.current++;
        loadWordleRound();
      }, 2500);
    }, animDelay);
  }
}

document.addEventListener('keydown', (e) => {
  if (!document.getElementById('game3').classList.contains('active')) return;

  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

  const key = e.key.toUpperCase();
  if (key === 'ENTER') {
    e.preventDefault();
    handleWordleKey('ENTER');
  } else if (key === 'BACKSPACE') {
    e.preventDefault();
    handleWordleKey('⌫');
  } else if (/^[A-Z]$/.test(key)) {
    handleWordleKey(key);
  }
});

function initRating() {
  document.getElementById('r-next').classList.add('hide');

  for (let i = 1; i <= 5; i++) {
    const slider = document.getElementById('r' + i);
    const valEl  = document.getElementById('r' + i + 'v');
    slider.value = 5;
    valEl.textContent = 5;
    slider.oninput = () => {
      valEl.textContent = slider.value;
      updateTotal();
    };
  }
  updateTotal();
}

function updateTotal() {
  let total = 0;
  for (let i = 1; i <= 5; i++) {
    total += parseInt(document.getElementById('r' + i).value);
  }
  document.getElementById('total').textContent = total;

  let msg;
  if (total >= 45)      msg = '🎉 PERFECT! Kita amazing! 💕';
  else if (total >= 40) msg = '😊 Almost perfect! Love you! ❤️';
  else if (total >= 35) msg = '💕 Pretty good! Let\'s make it better!';
  else                  msg = '😊 Thanks for being honest! Let\'s grow together! 💪';

  document.getElementById('r-msg').textContent = msg;
}

function submitRating() {
  const total = document.getElementById('total').textContent;
  alert('Rating kamu: ' + total + '/50\n\nThank you sayang! 💕');
  document.getElementById('r-next').classList.remove('hide');
}

function checkPass() {
  const input   = document.getElementById('pwd').value.trim();
  const correct = '050323';

  if (input === correct) {
    next('letter');
  } else {
    const err = document.getElementById('err');
    err.classList.remove('hide');
    document.getElementById('pwd').value = '';
    setTimeout(() => err.classList.add('hide'), 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const pwdInput = document.getElementById('pwd');
  if (pwdInput) {
    pwdInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkPass();
    });
  }
});

function openLetter() {
  if (letterOpened) return;
  letterOpened = true;

  const env = document.getElementById('env');
  env.classList.add('open');

  setTimeout(() => {
    env.style.display = 'none';
    document.getElementById('env-hint').classList.add('hide');
    document.getElementById('paper').classList.remove('hide');
  }, 600);
}

function createConfetti() {
  const container = document.getElementById('confetti');
  container.innerHTML = '';
  const colors = ['#ff2e63','#ff6b9d','#ffd60a','#06ffa5','#00f5ff'];

  for (let i = 0; i < 60; i++) {
    const conf = document.createElement('div');
    conf.style.cssText =
      'position:absolute;width:10px;height:10px;' +
      'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
      'left:' + (Math.random() * 100) + '%;top:-20px;' +
      'border-radius:' + (Math.random() > 0.5 ? '50%' : '0') + ';';
    container.appendChild(conf);

    const duration = 2000 + Math.random() * 2000;
    const xMove    = (Math.random() - 0.5) * 200;

    conf.animate(
      [
        { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
        { transform: 'translateY(' + window.innerHeight + 'px) translateX(' + xMove + 'px) rotate(' + (Math.random() * 720) + 'deg)', opacity: 0 }
      ],
      { duration, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' }
    );

    setTimeout(() => conf.remove(), duration);
  }
}

function restart() {
  if (!confirm('Main lagi dari awal? 🎮')) return;

  stopMemTimer();
  stopWordTimer();

  letterOpened = false;
  const env = document.getElementById('env');
  env.classList.remove('open');
  env.style.display = '';
  document.getElementById('paper').classList.add('hide');
  document.getElementById('env-hint').classList.remove('hide');

  document.getElementById('pwd').value = '';
  document.getElementById('err').classList.add('hide');

  document.getElementById('r-next').classList.add('hide');

  currentScreen = 0;
  updateProgress();
  next('start');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleWord(word) {
  let result;
  let attempts = 0;
  do {
    result = shuffle(word.split('')).join('');
    attempts++;
  } while (result === word && word.length > 1 && attempts < 20);
  return result;
}

window.addEventListener('load', () => {
  updateProgress();

  const finalScreen = document.getElementById('final');
  const observer = new MutationObserver(() => {
    if (finalScreen.classList.contains('active')) {
      createConfetti();
    }
  });
  observer.observe(finalScreen, { attributes: true, attributeFilter: ['class'] });
});