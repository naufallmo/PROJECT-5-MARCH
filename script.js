let current = 0;
const screens = ['start','ch1','game1','game2','game3','ch3','game4','pass','letter','final'];
let mem = {cards:[],flipped:[],matched:0,moves:0,time:0,timer:null};
let word = {words:['YOU','ARE','PERFECT'],current:0,score:0,timer:null,time:30};
let wordle = {
  words: ['CINTA','SASHA','TIBOO'],
  current: 0,
  attempts: 0,
  maxAttempts: 6,
  currentGuess: '',
  guesses: [],
  keyboard: {}
};

function next(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  current = screens.indexOf(id);
  updateProgress();
  window.scrollTo(0,0);
  
  if(id === 'game1') initMemory();
  if(id === 'game2') initWord();
  if(id === 'game3') initWordle();
  if(id === 'game4') initRating();
}

function updateProgress() {
  document.getElementById('progress').style.width = (current / (screens.length - 1) * 100) + '%';
}

// MEMORY GAME
function initMemory() {
  const emojis = ['💕','💐','💘','💯','📸','🎵','🚂','🫶'];
  mem = {cards: [...emojis,...emojis].sort(() => Math.random() - 0.5), flipped:[], matched:0, moves:0, time:0};
  
  const grid = document.getElementById('memory');
  grid.innerHTML = '';
  mem.cards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<span class="back">❓</span><span class="front hide">' + emoji + '</span>';
    card.onclick = () => flipCard(card, i, emoji);
    grid.appendChild(card);
  });
  
  startTimer();
}

function flipCard(card, i, emoji) {
  if(mem.flipped.length >= 2 || card.classList.contains('flip') || card.classList.contains('match')) return;
  
  card.classList.add('flip');
  card.querySelector('.back').classList.add('hide');
  card.querySelector('.front').classList.remove('hide');
  mem.flipped.push({card, i, emoji});
  
  if(mem.flipped.length === 2) {
    mem.moves++;
    document.getElementById('move').textContent = mem.moves;
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = mem.flipped;
  if(a.emoji === b.emoji && a.i !== b.i) {
    setTimeout(() => {
      a.card.classList.add('match');
      b.card.classList.add('match');
      mem.flipped = [];
      mem.matched++;
      document.getElementById('match').textContent = mem.matched + '/8';
      if(mem.matched === 8) {
        stopTimer();
        setTimeout(() => {
          alert('🎉 Selesai! Moves: ' + mem.moves + ', Time: ' + mem.time + 's');
          document.getElementById('mem-next').classList.remove('hide');
        }, 500);
      }
    }, 500);
  } else {
    setTimeout(() => {
      a.card.classList.remove('flip');
      b.card.classList.remove('flip');
      a.card.querySelector('.back').classList.remove('hide');
      a.card.querySelector('.front').classList.add('hide');
      b.card.querySelector('.back').classList.remove('hide');
      b.card.querySelector('.front').classList.add('hide');
      mem.flipped = [];
    }, 1000);
  }
}

function startTimer() {
  mem.timer = setInterval(() => {
    mem.time++;
    document.getElementById('time').textContent = mem.time + 's';
  }, 1000);
}

function stopTimer() {
  if(mem.timer) clearInterval(mem.timer);
}

// WORD SCRAMBLE
function initWord() {
  word = {words:['YOU','ARE','PERFECT'], current:0, score:0, time:30};
  loadWord();
}

function loadWord() {
  if(word.current >= word.words.length) {
    showWordScore();
    return;
  }
  
  document.getElementById('w-round').textContent = word.current + 1;
  const original = word.words[word.current];
  const scrambled = original.split('').sort(() => Math.random() - 0.5).join('');
  document.getElementById('scramble').textContent = scrambled;
  document.getElementById('w-input').value = '';
  document.getElementById('w-feed').className = 'hide';
  
  word.time = 30;
  if(word.timer) clearInterval(word.timer);
  word.timer = setInterval(() => {
    word.time--;
    document.getElementById('w-timer').textContent = word.time + 's';
    if(word.time <= 0) {
      clearInterval(word.timer);
      showFeedback(false, 'Waktu habis! Jawaban: ' + original);
      setTimeout(() => {
        word.current++;
        loadWord();
      }, 2000);
    }
  }, 1000);
}

function checkWord() {
  const input = document.getElementById('w-input').value.toUpperCase().trim();
  const correct = word.words[word.current];
  
  clearInterval(word.timer);
  
  if(input === correct) {
    word.score++;
    showFeedback(true, '✓ Benar!');
  } else {
    showFeedback(false, '✗ Salah! Jawaban: ' + correct);
  }
  
  setTimeout(() => {
    word.current++;
    loadWord();
  }, 2000);
}

function showFeedback(correct, msg) {
  const feed = document.getElementById('w-feed');
  feed.textContent = msg;
  feed.className = correct ? 'ok' : 'no';
}

function showWordScore() {
  document.getElementById('w-input').classList.add('hide');
  document.querySelector('#game2 > button').classList.add('hide');
  document.getElementById('scramble').classList.add('hide');
  const wordInfo = document.querySelector('.word-info');
  if(wordInfo) wordInfo.classList.add('hide');
  
  const scoreDiv = document.getElementById('w-score');
  scoreDiv.classList.remove('hide');
  document.getElementById('w-final').textContent = word.score;
  
  let msg = '';
  if(word.score === 3) msg = '🎉 Perfect! Kamu hebat!';
  else if(word.score >= 2) msg = '😊 Bagus! Good job!';
  else msg = '😅 Lumayan! Coba lagi nanti ya!';
  
  document.getElementById('w-msg').textContent = msg;
  document.getElementById('w-next').classList.remove('hide');
}

// ========== WORDLE GAME ==========
const KEYBOARD_LAYOUT = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫']
];

function initWordle() {
  wordle = {
    words: ['CINTA','SASHA','TIBOO'],
    current: 0,
    attempts: 0,
    maxAttempts: 6,
    currentGuess: '',
    guesses: [],
    keyboard: {}
  };
  loadWordleRound();
}

function loadWordleRound() {
  if(wordle.current >= wordle.words.length) {
    document.getElementById('wordle-msg').textContent = '🎉 Semua kata berhasil ditebak!';
    document.getElementById('wordle-msg').className = 'win';
    document.getElementById('wordle-next').classList.remove('hide');
    return;
  }
  
  const targetWord = wordle.words[wordle.current];
  wordle.attempts = 0;
  wordle.currentGuess = '';
  wordle.guesses = [];
  wordle.keyboard = {};
  
  document.getElementById('wordle-round').textContent = wordle.current + 1;
  document.getElementById('wordle-attempt').textContent = wordle.maxAttempts;
  
  createWordleGrid(targetWord.length);
  createWordleKeyboard();
}

function createWordleGrid(wordLength) {
  const grid = document.getElementById('wordle-grid');
  grid.innerHTML = '';
  
  for(let i = 0; i < wordle.maxAttempts; i++) {
    const row = document.createElement('div');
    row.className = 'wordle-row' + (wordLength === 6 ? ' six' : '');
    row.id = 'wordle-row-' + i;
    
    for(let j = 0; j < wordLength; j++) {
      const cell = document.createElement('div');
      cell.className = 'wordle-cell';
      cell.id = `cell-${i}-${j}`;
      row.appendChild(cell);
    }
    
    grid.appendChild(row);
  }
}

function createWordleKeyboard() {
  const keyboard = document.getElementById('wordle-keyboard');
  keyboard.innerHTML = '';
  
  KEYBOARD_LAYOUT.forEach(row => {
    const keyRow = document.createElement('div');
    keyRow.className = 'wordle-keyboard-row';
    
    row.forEach(key => {
      const keyBtn = document.createElement('button');
      keyBtn.className = 'wordle-key' + (key.length > 1 ? ' wide' : '');
      keyBtn.textContent = key;
      keyBtn.onclick = () => handleWordleKey(key);
      keyBtn.id = 'key-' + key;
      keyRow.appendChild(keyBtn);
    });
    
    keyboard.appendChild(keyRow);
  });
}

function handleWordleKey(key) {
  const targetWord = wordle.words[wordle.current];
  
  if(key === 'ENTER') {
    if(wordle.currentGuess.length === targetWord.length) {
      submitWordleGuess();
    }
  } else if(key === '⌫') {
    wordle.currentGuess = wordle.currentGuess.slice(0, -1);
    updateWordleDisplay();
  } else if(wordle.currentGuess.length < targetWord.length) {
    wordle.currentGuess += key;
    updateWordleDisplay();
  }
}

function updateWordleDisplay() {
  const targetWord = wordle.words[wordle.current];
  const row = document.getElementById('wordle-row-' + wordle.attempts);
  
  for(let i = 0; i < targetWord.length; i++) {
    const cell = row.children[i];
    cell.textContent = wordle.currentGuess[i] || '';
  }
}

function submitWordleGuess() {
  const targetWord = wordle.words[wordle.current];
  const guess = wordle.currentGuess;
  const row = document.getElementById('wordle-row-' + wordle.attempts);
  
  const result = [];
  const targetLetters = targetWord.split('');
  const guessLetters = guess.split('');
  
  for(let i = 0; i < guess.length; i++) {
    if(guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      targetLetters[i] = null;
      guessLetters[i] = null;
    }
  }
  
  for(let i = 0; i < guess.length; i++) {
    if(result[i]) continue;
    
    const idx = targetLetters.indexOf(guessLetters[i]);
    if(idx !== -1) {
      result[i] = 'present';
      targetLetters[idx] = null;
    } else {
      result[i] = 'absent';
    }
  }
  
  for(let i = 0; i < guess.length; i++) {
    const cell = row.children[i];
    setTimeout(() => {
      cell.classList.add(result[i]);
    }, i * 100);
    
    const letter = guess[i];
    if(!wordle.keyboard[letter] || result[i] === 'correct') {
      wordle.keyboard[letter] = result[i];
      const keyBtn = document.getElementById('key-' + letter);
      if(keyBtn) {
        keyBtn.classList.remove('correct', 'present', 'absent');
        keyBtn.classList.add(result[i]);
      }
    }
  }
  
  wordle.guesses.push(guess);
  wordle.attempts++;
  wordle.currentGuess = '';
  
  document.getElementById('wordle-attempt').textContent = wordle.maxAttempts - wordle.attempts;
  
  setTimeout(() => {
    if(guess === targetWord) {
      document.getElementById('wordle-msg').textContent = '✓ Benar! Kata: ' + targetWord;
      document.getElementById('wordle-msg').className = 'win';
      setTimeout(() => {
        wordle.current++;
        document.getElementById('wordle-msg').className = 'hide';
        loadWordleRound();
      }, 2000);
    } else if(wordle.attempts >= wordle.maxAttempts) {
      document.getElementById('wordle-msg').textContent = '✗ Kata yang benar: ' + targetWord;
      document.getElementById('wordle-msg').className = 'lose';
      setTimeout(() => {
        wordle.current++;
        document.getElementById('wordle-msg').className = 'hide';
        loadWordleRound();
      }, 3000);
    }
  }, guess.length * 100 + 100);
}

document.addEventListener('keydown', (e) => {
  if(!document.getElementById('game3').classList.contains('active')) return;
  
  const key = e.key.toUpperCase();
  if(key === 'ENTER') {
    handleWordleKey('ENTER');
  } else if(key === 'BACKSPACE') {
    handleWordleKey('⌫');
  } else if(/^[A-Z]$/.test(key)) {
    handleWordleKey(key);
  }
});

function initRating() {
  for(let i = 1; i <= 5; i++) {
    const slider = document.getElementById('r' + i);
    const val = document.getElementById('r' + i + 'v');
    slider.oninput = () => {
      val.textContent = slider.value;
      updateTotal();
    };
  }
  updateTotal();
}

function updateTotal() {
  let total = 0;
  for(let i = 1; i <= 5; i++) {
    total += parseInt(document.getElementById('r' + i).value);
  }
  document.getElementById('total').textContent = total;
  
  let msg = '';
  if(total >= 45) msg = '🎉 PERFECT! Kita amazing! 💕';
  else if(total >= 40) msg = '😊 Almost perfect! Love you! ❤️';
  else if(total >= 35) msg = '💕 Pretty good! Let\'s make it better!';
  else msg = '😊 Thanks for being honest! Let\'s grow together! 💪';
  
  document.getElementById('r-msg').textContent = msg;
}

function submitRating() {
  const total = parseInt(document.getElementById('total').textContent);
  alert('Rating kamu: ' + total + '/50\n\nThank you sayang! 💕');
  document.getElementById('r-next').classList.remove('hide');
}


function checkPass() {
  const input = document.getElementById('pwd').value;
  const correct = '050323';
  
  if(input === correct) {
    next('letter');
  } else {
    const err = document.getElementById('err');
    err.classList.remove('hide');
    document.getElementById('pwd').value = '';
    setTimeout(() => err.classList.add('hide'), 2000);
  }
}

document.getElementById('pwd')?.addEventListener('keypress', e => {
  if(e.key === 'Enter') checkPass();
});

function openLetter() {
  document.getElementById('env').classList.add('open');
  setTimeout(() => {
    document.getElementById('env').style.display = 'none';
    document.querySelector('#letter .hint').classList.add('hide');
    document.getElementById('paper').classList.remove('hide');
  }, 600);
}

function createConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['#ff2e63','#ff6b9d','#ffd60a','#06ffa5','#00f5ff'];
  
  for(let i = 0; i < 50; i++) {
    const conf = document.createElement('div');
    conf.style.cssText = `position:absolute;width:10px;height:10px;background:${colors[Math.floor(Math.random()*colors.length)]};
    left:${Math.random()*100}%;top:-20px;border-radius:${Math.random()>.5?'50%':'0'};opacity:1`;
    container.appendChild(conf);
    
    const duration = 2000 + Math.random() * 2000;
    const x = (Math.random() - 0.5) * 200;
    
    conf.animate([
      {transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1},
      {transform: `translateY(${window.innerHeight}px) translateX(${x}px) rotate(${Math.random()*720}deg)`, opacity: 0}
    ], {duration: duration, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)'});
    
    setTimeout(() => conf.remove(), duration);
  }
}

function restart() {
  if(confirm('Main lagi dari awal? 🎮')) {
    current = 0;
    next('start');
    document.querySelectorAll('.hide').forEach(el => el.classList.remove('hide'));
    document.getElementById('env').classList.remove('open');
    document.getElementById('env').style.display = 'block';
    document.getElementById('paper').classList.add('hide');
  }
}

function startStory() {
  const music = document.getElementById("bgm");
  music.play();
  next('ch1');
}

window.onload = () => {
  updateProgress();
  
  const observer = new MutationObserver(() => {
    if(document.getElementById('final').classList.contains('active')) {
      createConfetti();
    }
  });
  observer.observe(document.getElementById('final'), {attributes: true, attributeFilter: ['class']});
};