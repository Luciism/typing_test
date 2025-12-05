word_lists = {
  easy: [
    "the",
    "be",
    "to",
    "of",
    "and",
    "a",
    "in",
    "that",
    "have",
    "it",
    "for",
    "on",
    "with",
    "he",
    "as",
    "you",
    "do",
    "at",
    "but",
    "this",
    "they",
    "his",
    "by",
    "from",
    "she",
    "or",
    "an",
    "will",
    "my",
    "one",
    "all",
    "would",
    "there",
    "their",
    "what",
    "so",
    "up",
    "out",
    "if",
    "about",
    "who",
    "get",
    "which",
    "go",
    "me",
    "when",
    "make",
    "can",
    "like",
    "time",
    "no",
    "just",
    "him",
    "know",
    "take",
    "people",
    "into",
    "year",
    "your",
    "good",
    "some",
    "could",
    "them",
    "see",
    "other",
    "than",
    "then",
    "now",
    "look",
    "only",
    "come",
    "its",
    "over",
    "think",
    "also",
    "back",
    "after",
    "use",
    "two",
    "how",
    "our",
    "work",
    "first",
    "well",
    "way",
    "even",
    "new",
    "want",
    "because",
    "any",
    "these",
    "give",
    "day",
    "most",
    "us",
    "work",
    "year",
    "long",
    "school",
    "friend",
    "family",
    "house",
    "street",
    "country",
    "service",
    "around",
    "terrible",
    "understand",
    "important",
    "interesting",
    "necessary",
    "difficult",
    "terrible",
    "interesting",
    "possible",
    "manage",
    "instead",
    "account",
    "public",
    "include",
    "thing",
    "people",
    "state",
    "result",
    "likely",
    "system",
    "different",
    "meaning",
    "control",
    "party",
    "always",
    "moment",
    "center",
    "company",
    "economy",
    "instance",
    "month",
    "week",
    "account",
    "govern",
    "document",
    "country",
    "problem",
    "explain",
    "develop",
  ],
};

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Focus typing container
const typingBox = document.getElementById("typing-box");
const wordsElement = typingBox.querySelector(".words");

typingBox.addEventListener("click", () => {
  typingBox.classList.add("focused");
});

window.addEventListener("click", (e) => {
  if (!typingBox.contains(e.target)) {
    typingBox.classList.remove("focused");
  }
});

class SummaryManager {
  summaryContainer = document.getElementById("summary-info");

  durationStatElement = document.getElementById("summary-duration-stat");
  wpmStatElement = document.getElementById("summary-wpm-stat");
  wordsTotalStatElement = document.getElementById("summary-words-total-stat");
  mistakesStatElement = document.getElementById("summary-mistakes-stat");

  summaryContinueBtn = document.getElementById("summary-continue-btn");

  constructor() {
    this.summaryContinueBtn.onclick = () => {
      this.hideSummary();
      this.onContinue();
    };
  }

  prepareSummary({ gameDuration, wpm, wordsTyped, mistakes }) {
    this.durationStatElement.innerText = gameDuration;
    this.wpmStatElement.innerText = wpm;
    this.wordsTotalStatElement.innerText = wordsTyped;
    this.mistakesStatElement.innerText = mistakes;
  }

  clearSummary() {
    this.prepareSummary({
      gameTime: "--",
      wpm: "--",
      mistakes: "--",
      wordsTyped: "--",
    });
  }

  showSummary() {
    this.summaryContainer.classList.add("visible");
  }

  hideSummary(clear = true) {
    if (clear) {
      this.clearSummary();
    }
    this.summaryContainer.classList.remove("visible");
  }

  onContinue() {} // default implmentation
}

class WordsManager {
  constructor(difficulty) {
    this.difficulty = difficulty;
  }

  randomWord() {
    return getRandomItem(word_lists[this.difficulty]);
  }

  buildWordElement(word, current) {
    word += " "; // Add space char

    let wordEl = document.createElement("span");
    wordEl.classList.add("word");

    if (current == true) {
      wordEl.classList.add("current-word");
    }

    for (let i = 0; i < word.length; i++) {
      let charEl = document.createElement("span");
      charEl.innerText = word[i];

      if (i == 0 && current == true) {
        charEl.classList.add("current-char");
      }

      wordEl.appendChild(charEl);
    }

    return wordEl;
  }

  appendNewWord(current = false) {
    wordsElement.appendChild(this.buildWordElement(this.randomWord(), current));
  }

  populateWordsElement(words = 100) {
    wordsElement.innerHTML = null;

    for (let i = 0; i < words; i++) {
      this.appendNewWord(i == 0 ? true : false);
    }
  }
}

// new WordsManager("easy").populateWordsElement(100); // Populate on page load

class TypingManager {
  constructor(difficulty = "easy", wordsManager = null, resetKey = null) {
    this.disabled = false;

    if (!wordsManager) {
      wordsManager = new WordsManager(difficulty);
    }

    this.wordsManager = wordsManager;
    this.difficulty = difficulty;

    this.wordsManager.populateWordsElement();

    // Add key event listeners
    this._handleKeyPressEvent = (e) => {
      if (typingBox.classList.contains("focused")) {
        if (e.key == " ") {
          e.preventDefault(); // Prevent scrolling
        }
        if (!this.disabled) {
          this.handleKeyPress(e.key);
        }
      }
    };
    window.addEventListener("keypress", this._handleKeyPressEvent);

    this._handleKeyDownEvent = (e) => {
      if (e.key == resetKey) {
        e.preventDefault();
        this.onResetKeyPress();
        return;
      }

      if (e.key == "Backspace" && !this.disabled) {
        e.preventDefault();
        this.handleBackspace();
      }
    };
    window.addEventListener("keydown", this._handleKeyDownEvent);
  }

  currentWord() {
    return wordsElement.querySelector(".current-word");
  }

  currentChar(word) {
    if (!word) {
      word = this.currentWord();
    }
    return word.querySelector(".current-char");
  }

  _undoChar(char) {
    char.classList.remove("correct-char");
    char.classList.remove("incorrect-char");
    char.classList.add("current-char");
  }

  handleBackspace() {
    const currentWord = this.currentWord();
    const currentChar = this.currentChar(currentWord);

    currentWord.scrollIntoView({ behavior: "smooth" });

    // Move to previous char
    const previousWord = currentWord.previousSibling;
    const previousChar = currentChar.previousSibling;

    if (previousChar || previousWord) {
      // Remove current char class only if there is chars before
      currentChar.classList.remove("current-char");
    }

    if (previousChar) {
      this._undoChar(previousChar);
    } else {
      // Move to previous word

      if (previousWord) {
        currentWord.classList.remove("current-word");
        previousWord.classList.add("current-word");

        const lastChar = previousWord.lastChild;
        this._undoChar(lastChar);
      }
    }
  }

  handleKeyPress(key) {
    this.onKeyPress(key);

    const currentWord = this.currentWord();
    const currentChar = this.currentChar(currentWord);

    currentWord.scrollIntoView({ behavior: "smooth" });

    // Set correct / incorrect char color
    if (key === currentChar.innerText) {
      currentChar.classList.add("correct-char");
    } else {
      currentChar.classList.add("incorrect-char");
    }

    // Change current char
    currentChar.classList.remove("current-char"); // Remove
    const nextChar = currentChar.nextSibling;

    if (nextChar) {
      nextChar.classList.add("current-char");
    } else {
      // Move on to next word
      currentWord.classList.remove("current-word");
      this.wordsManager.appendNewWord();

      const nextWord = currentWord.nextSibling;
      if (nextWord) {
        nextWord.classList.add("current-word");
        nextWord.firstChild.classList.add("current-char");

        // Get index of typed word
        const wordsElementChildrenArr = Array.from(wordsElement.children);
        const currentWordIndex = wordsElementChildrenArr.indexOf(currentWord);

        // Check if word was typed correctly
        let typedCorrectly = true;
        for (let i = 0; i < currentWord.childNodes.length; i++) {
          if (
            currentWord.childNodes.item(i).classList.contains("incorrect-char")
          ) {
            typedCorrectly = false;
            break;
          }
        }

        this.onWordComplete(currentWordIndex, typedCorrectly);
      }
    }
  }

  onKeyPress(key) {} // Default implmentation
  onResetKeyPress() {} // Default implmentation
  onWordComplete(wordIndex, typedCorrectly) {} // Default implmentation

  reset() {
    this.wordsManager.populateWordsElement();
    this.disabled = false;
    typingBox.scroll({ top: 0, behavior: "smooth" });
  }

  cleanup() {
    window.removeEventListener("keypress", this._handleKeyPressEvent);
    window.removeEventListener("keydown", this._handleKeyDownEvent);
  }

  changeDifficulty(newDifficulty) {
    this.difficulty = newDifficulty;
    this.wordsManager.difficulty = newDifficulty;
    this.reset();
  }
}

// new TypingManager("easy");

class StatsManager {
  constructor() {
    this.wpmElement = document.getElementById("stat-wpm");
    this.timeRemainingElement = document.getElementById("stat-game-timer");
  }

  updateWpmStat(wpmValue) {
    this.wpmElement.innerText = wpmValue;
  }

  updateTimeRemaining(timeRemainingValue) {
    this.timeRemainingElement.innerText = timeRemainingValue;
  }

  resetWpmStat() {
    this.updateWpmStat("--");
  }

  resetTimeRemaining() {
    this.updateTimeRemaining("--");
  }
}

class GameController {
  constructor() {
    this.gameStartTime = null;
    this.wordsTyped = 0;
    this.correctlyTypedWords = 0;
    this.typedWordIndices = [];

    this.statsManager = new StatsManager();
    this.summaryManager = new SummaryManager();
    this.summaryManager.onContinue = () => {
      this.resetGame();
    };

    this.resetButton = document.getElementById("reset-btn");

    // Difficulty select menu
    this.difficultySelect = document.getElementById("difficulty-select");
    this.difficulty = this.difficultySelect.selectedOptions[0].value;

    this.typingManager = new TypingManager(this.difficulty, null, "Tab");

    this.resetButton.onclick = () => {
      this.resetGame();
    };

    this.difficultySelect.onchange = () => {
      this.difficulty = this.difficultySelect.selectedOptions[0].value;
      this.typingManager.changeDifficulty(this.difficulty);
    };

    // Duration select menu
    this.durationSelect = document.getElementById("duration-select");
    this.durationSecs = parseInt(this.durationSelect.selectedOptions[0].value);

    this.durationSelect.onchange = () => {
      this.durationSecs = parseInt(
        this.durationSelect.selectedOptions[0].value
      );
      this.resetGame();
    };
    this.statsManager.updateTimeRemaining(this.durationSecs);

    this.typingManager.onResetKeyPress = () => {
      this.summaryManager.hideSummary();
      this.resetGame();
    };

    this.typingManager.onKeyPress = (key) => {
      if (!this.gameStartTime) {
        this.gameStartTime = Date.now() / 1000;

        if (this.durationSecs !== null) {
          this.statsManager.updateTimeRemaining(this.durationSecs);

          this.countdownInterval = setInterval(() => {
            const timeElapsed = Date.now() / 1000 - this.gameStartTime;
            const timeRemaining = this.durationSecs - timeElapsed;

            this.statsManager.updateTimeRemaining(Math.round(timeRemaining));
          }, 1000);

          this.gameEndTimeout = setTimeout(() => {
            clearInterval(this.countdownInterval);
            this.statsManager.updateTimeRemaining(0);
            this.endGame();
          }, this.durationSecs * 1000);
        }
      }
    };

    this.typingManager.onWordComplete = (wordIndex, correct) => {
      if (correct && !this.typedWordIndices.includes(wordIndex)) {
        this.correctlyTypedWords += 1;
      }

      const wpm = this.calculateWPM(Date.now() / 1000 - this.gameStartTime);
      this.statsManager.updateWpmStat(wpm);

      this.wordsTyped += 1;
      this.typedWordIndices.push(wordIndex);
    };
  }

  calculateWPM(durationSeconds) {
    const wpm = (this.correctlyTypedWords / durationSeconds) * 60;

    return Math.round(wpm);
  }

  endGame() {
    this.typingManager.disabled = true;

    this.summaryManager.prepareSummary({
      gameDuration: `${this.durationSecs}s`,
      wordsTyped: this.typedWordIndices.length,
      mistakes: this.wordsTyped - this.correctlyTypedWords,
      wpm: this.calculateWPM(Date.now() / 1000 - this.gameStartTime),
    });
    this.summaryManager.showSummary();
  }

  resetGame() {
    this.typingManager.reset();
    this.statsManager.updateTimeRemaining(this.durationSecs);
    this.statsManager.resetWpmStat();
    this.typedWordIndices = [];
    this.correctlyTypedWords = 0;
    this.wordsTyped = 0;
    this.gameStartTime = null;

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.gameEndTimeout) {
      clearTimeout(this.gameEndTimeout);
    }
  }
}

new GameController();
