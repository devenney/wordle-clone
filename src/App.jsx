import { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";

const GUESS_WRONG = 1;
const GUESS_CLOSE = 2;
const GUESS_CORRECT = 3;

const TOAST_COLOUR_DEFAULT = "bg-gray-500";
const TOAST_COLOUR_ERROR = "bg-red-500";

const FIVE_WORDS_URL =
  "https://cheaderthecoder.github.io/5-Letter-words/words.json";

function App() {
  const NUM_ROWS = 6;
  const WORD_LENGTH = 5;

  const [wordList, setWordList] = useState(Array);
  const [word, setWord] = useState("");
  const [guesses, setGuesses] = useState(Array(NUM_ROWS).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const [evaluations, setEvaluations] = useState(
    Array(NUM_ROWS)
      .fill(null)
      .map(() => Array(WORD_LENGTH).fill(0))
  );
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [toast, setToast] = useState("");
  const [toastColour, setToastColour] = useState("bg-gray-500");
  const [isInvalidWord, setIsInvalidWord] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Check for stored state on component mount
  useEffect(() => {
    // We need to load today's word first to see if the state is stale.
    if (word === "") return;

    const storedState = localStorage.getItem("gameState");
    console.log("Loading game state:", storedState);
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      console.log("Parsed state:", parsedState);

      // Check if state is stale.
      if (parsedState.word === word) {
        setGuesses(parsedState.guesses);
        setEvaluations(parsedState.evaluations);
        setCurrentRow(parsedState.currentRow);
        setGameOver(parsedState.gameOver);
        setGameWon(parsedState.gameWon);
      }
    }

    setLoaded(true);
  }, [word]);

  // Store game state
  useEffect(() => {
    // Don't write unless we've already tried to load.
    if (!loaded) return;
    console.log(
      "Loaded is true, state is currently:",
      guesses,
      evaluations,
      currentRow
    );

    const storeGameState = () => {
      const gameState = {
        word,
        guesses,
        evaluations,
        currentRow,
        gameOver,
        gameWon,
      };

      localStorage.setItem("gameState", JSON.stringify(gameState));
    };

    console.log("Storing game state:", guesses);
    storeGameState();
  }, [loaded, word, currentRow, guesses, evaluations, gameOver, gameWon]);

  const nonEmptyGuesses = useMemo(
    () => guesses.filter((entry) => entry.length > 0).length,
    [guesses]
  );

  const letterState = useMemo(() => {
    let states = {};

    for (let i = 0; i < evaluations.length; i++) {
      for (let j = 0; j < WORD_LENGTH; j++) {
        const letter = guesses[i][j];
        if (!letter) continue;

        const letterState = evaluations[i][j];

        if (states[letter] === undefined) {
          states[letter] = 0;
        }

        if (letterState > states[letter]) {
          states[letter] = letterState;
        }
      }
    }

    return states;
  }, [guesses, evaluations]);

  useEffect(() => {
    fetch(FIVE_WORDS_URL)
      .then((response) => response.json())
      .then((responseJson) => {
        setWordList(responseJson.words);
        console.log("Fetched word list, length %d", responseJson.words.length);
      })
      .catch((err) => console.error("Failed to fetch words:", err));
  }, []);

  function getTodaySeed() {
    const today = new Date();
    return `${today.getDate()}-${today.getMonth()}-${today.getFullYear()}`;
  }

  function seededRandom(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  }

  useEffect(() => {
    if (wordList.length === 0) return;

    const seed = getTodaySeed();
    const rand = seededRandom(seed);
    const index = Math.floor(rand * wordList.length);
    const chosenWord = wordList[index];

    console.log(
      "We have randomly selected index %d (seed %s, rand %s)",
      index,
      seed,
      rand
    );

    setWord(chosenWord);
    console.log("Set word:", chosenWord);
  }, [wordList]);

  const handleKey = useCallback(
    (key) => {
      if (gameOver) return;

      key = key.toLowerCase();

      if (/^[a-z]{1}$/.test(key)) {
        setGuesses((prev) => {
          const updated = [...prev];
          if (updated[currentRow].length < WORD_LENGTH) {
            updated[currentRow] += key;
          }
          return updated;
        });
      }

      if (key === "backspace") {
        setGuesses((prev) => {
          const updated = [...prev];
          updated[currentRow] = updated[currentRow].slice(0, -1);
          return updated;
        });
      }

      if (key === "enter") {
        if (guesses[currentRow].length === WORD_LENGTH) {
          if (!wordList.includes(guesses[currentRow])) {
            setToastColour(TOAST_COLOUR_ERROR);
            setToast("This word is not in the word list!");
            setIsInvalidWord(true);
            return;
          }

          if (guesses.slice(0, currentRow).includes(guesses[currentRow])) {
            setToastColour(TOAST_COLOUR_ERROR);
            setToast("This word has already been guessed!");
            setIsInvalidWord(true);
            return;
          }

          if (guesses[currentRow] === word) {
            setGameWon(true);
            setGameOver(true);
          }

          const evaluation = [];

          guesses[currentRow].split("").forEach((character, index) => {
            if (character === word[index]) {
              evaluation.push(GUESS_CORRECT);
            } else if (word.includes(character)) {
              evaluation.push(GUESS_CLOSE);
            } else {
              evaluation.push(GUESS_WRONG);
            }
          });

          setEvaluations((prev) => {
            const updated = [...prev];
            updated[currentRow] = evaluation;
            return updated;
          });

          if (currentRow + 1 === NUM_ROWS) {
            setGameOver(true);
            return;
          }

          setCurrentRow((prev) => prev + 1);
        }
      }
    },
    [guesses, currentRow, word, wordList, gameOver]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      handleKey(e.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKey]);

  // Hide toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => {
        setToast(null);
        setToastColour(TOAST_COLOUR_DEFAULT);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [toast]);

  const handleAnimationEnd = (e) => {
    // Once the shake animation is done, remove the shake class
    e.target.classList.remove("animate-shake");
    setIsInvalidWord(false);
  };

  const Keyboard = ({ onKey }) => {
    const rows = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"],
    ];

    const getLabel = (key) => {
      if (key === "Enter") return "⏎";
      if (key === "Backspace") return "⌫";
      return key.toUpperCase();
    };

    const getKeyClass = (key) => {
      const keyState = letterState[key];
      switch (keyState) {
        case GUESS_WRONG:
          return "bg-red-300 active:bg-red-500";
        case GUESS_CLOSE:
          return "bg-yellow-300 active:bg-yellow-500";
        case GUESS_CORRECT:
          return "bg-green-300 active:bg-green-500";
        default:
          return "bg-gray-300 active:bg-gray-500";
      }
    };

    return (
      <div className="space-y-2 px-2 w-full max-w-md mx-auto">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-1 w-full overflow-hidden"
          >
            {row.map((key) => (
              <button
                key={key}
                onClick={() => onKey(key)}
                className={`flex-1 max-w-[10%] min-w-[32px] sm:min-w-[40px] px-2 py-3 rounded-lg text-lg sm:text-xl font-bold uppercase ${getKeyClass(
                  key
                )}`}
                style={{ whiteSpace: "nowrap" }}
              >
                {getLabel(key)}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const handleShare = useCallback(() => {
    // Generate shareable result with emojis
    const generateShareableResult = () => {
      console.log("nonEmptyGuesses:", nonEmptyGuesses);

      let resultText = `I ${gameWon ? "won" : "lost"} today's Wordle Clone${
        gameWon ? ` in ${nonEmptyGuesses} guesses` : ""
      }.\n\n`;

      // Map each guess to corresponding emojis
      guesses.slice(0, nonEmptyGuesses).forEach((guess, rowIndex) => {
        const rowEvaluation = evaluations[rowIndex];
        const guessResult = guess
          .split("")
          .map((_, index) => {
            switch (rowEvaluation[index]) {
              case GUESS_CORRECT:
                return "🍏";
              case GUESS_CLOSE:
                return "🍊";
              case GUESS_WRONG:
                return "🍅";
              default:
                return "";
            }
          })
          .join("");
        resultText += `${guessResult}\n`; // Add each guess's result to the resultText
      });

      resultText +=
        "\nTry it yourself at https://devenney.github.io/wordle-clone/.";

      return resultText;
    };

    const resultText = generateShareableResult();

    // Copy result to clipboard
    navigator.clipboard
      .writeText(resultText)
      .then(() => {
        setToast("Result copied to clipboard!");
      })
      .catch((error) => {
        setToastColour(TOAST_COLOUR_ERROR);
        setToast("Failed to copy the result. Try again.");
        console.error("Error copying result to clipboard:", error);
      });
  }, [gameWon, guesses, nonEmptyGuesses, evaluations]);

  return (
    <>
      {loaded ? (
        <div className="flex flex-col items-center justify-center h-screen safe-flex-screen">
          {/* Game grid */}
          <div className="flex flex-col items-center justify-center space-y-2">
            {Array.from({ length: NUM_ROWS }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className={`flex gap-2 justify-center ${
                  isInvalidWord && rowIndex === currentRow
                    ? "animate-shake"
                    : ""
                }`}
                onAnimationEnd={handleAnimationEnd} // Listen for the end of the shake animation
              >
                {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                  const letter = guesses[rowIndex][colIndex] || "";
                  const result = evaluations[rowIndex][colIndex];

                  let bgClass = "";
                  switch (result) {
                    case GUESS_WRONG:
                      bgClass = "bg-red-500";
                      break;
                    case GUESS_CLOSE:
                      bgClass = "bg-yellow-500";
                      break;
                    case GUESS_CORRECT:
                      bgClass = "bg-green-500";
                      break;
                  }

                  return (
                    <span
                      key={colIndex}
                      className={
                        "w-12 h-12 border border-gray-400 flex items-center justify-center text-2xl font-bold " +
                        bgClass
                      }
                    >
                      {letter.toUpperCase()}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Message container */}
          <div className="w-full max-w-md text-center mx-auto mt-4 h-20 flex items-center justify-center pt-20">
            {gameOver && (
              <span className="text-2xl text-center w-full">
                {gameWon ? (
                  <>
                    <div className="bg-green-100 text-green-700 border-2 border-green-500 p-4 rounded-lg">
                      {`You won in ${nonEmptyGuesses} guess${
                        nonEmptyGuesses > 1 ? "es" : ""
                      }!`}
                    </div>
                  </>
                ) : (
                  <div className="bg-red-100 text-red-700 border-2 border-red-500 p-4 rounded-lg">
                    You lost!
                  </div>
                )}
                <span>
                  Today's word was{" "}
                  <a
                    href={`https://en.wiktionary.org/wiki/${word}`}
                    className="underline font-bold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {word}
                  </a>
                  .
                </span>

                {/* Share Result Button */}
                <div className="mt-4">
                  {gameOver && (
                    <button
                      onClick={handleShare}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Share Result
                    </button>
                  )}
                </div>
              </span>
            )}

            {/* Virtual Keyboard */}
            <div className="keyboard-wrapper h-[100px]">
              {!gameOver && <Keyboard onKey={handleKey} />}
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed top-5 left-1/2 transform -translate-x-1/2 ${toastColour} text-white p-4 rounded-md shadow-md`}
            >
              {toast}
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default App;
