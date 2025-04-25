import { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";

const FIVE_WORDS_URL =
  "https://cheaderthecoder.github.io/5-Letter-words/words.json";

function App() {
  const NUM_ROWS = 6;
  const WORD_LENGTH = 5;

  const [wordList, setWordList] = useState(Array);
  const [word, setWord] = useState("");
  const [guesses, setGuesses] = useState(Array(NUM_ROWS).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const [evaluations, setEvaluations] = useState(Array(NUM_ROWS).fill(0)); // 0 = Default, 1 = Correct, 2 = Close, 3 = Wrong
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [toast, setToast] = useState(null);
  const [isInvalidWord, setIsInvalidWord] = useState(false);
  const [vh, setVh] = useState(window.innerHeight * 0.01);

  const nonEmptyGuesses = useMemo(
    () => guesses.filter((entry) => entry.length > 0).length,
    [guesses]
  );

  useEffect(() => {
    const handleResize = () => {
      setVh(window.innerHeight * 0.01);
    };

    handleResize(); // Call once on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            setToast("This word is not in the word list!");
            setIsInvalidWord(true);
            return;
          }

          if (guesses.slice(0, currentRow).includes(guesses[currentRow])) {
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
              evaluation.push(1);
            } else if (word.includes(character)) {
              evaluation.push(2);
            } else {
              evaluation.push(3);
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

    return (
      <div className="mt-4 space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                className="bg-gray-300 rounded px-2 py-2 min-w-[32px] text-center text-sm font-bold uppercase active:bg-gray-500"
                onClick={() => onKey(key)}
              >
                {key === "Backspace" ? "⌫" : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        {/* Game grid */}
        <div className="flex flex-col items-center justify-center space-y-2">
          {Array.from({ length: NUM_ROWS }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex gap-2 justify-center ${
                isInvalidWord && rowIndex === currentRow ? "animate-shake" : ""
              }`}
              onAnimationEnd={handleAnimationEnd} // Listen for the end of the shake animation
            >
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                const letter = guesses[rowIndex][colIndex] || "";
                const result = evaluations[rowIndex][colIndex];

                let bgClass = "";
                switch (result) {
                  case 1:
                    bgClass = "bg-green-500";
                    break;
                  case 2:
                    bgClass = "bg-yellow-500";
                    break;
                  case 3:
                    bgClass = "bg-red-500";
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
        <div className="w-full max-w-xs text-center mx-auto mt-4 h-20 flex items-center justify-center pt-10">
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
            </span>
          )}
        </div>

        {/* Virtual Keyboard */}
        <Keyboard onKey={handleKey} />

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-4 rounded-md shadow-md">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
