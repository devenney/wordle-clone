import { useState, useEffect } from "react";
import "./App.css";

function fetchWord() {
  // Avoiding CORS issues, returning a placeholder value.
  return Promise.resolve("genie");
}

function App() {
  const NUM_ROWS = 6;
  const WORD_LENGTH = 5;

  const [word, setWord] = useState("");
  const [guesses, setGuesses] = useState(Array(NUM_ROWS).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const [evaluations, setEvaluations] = useState(Array(NUM_ROWS).fill(0)); // 0 = Default, 1 = Correct, 2 = Close, 3 = Wrong

  useEffect(() => {
    fetchWord()
      .then((word) => {
        setWord(word);
        console.log("Fetched word: ", word);
      })
      .catch((err) => {
        console.error("Failed to fetch word: ", err);
      });
  }, []); // Ensure we run only once.

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // Type (only allow A-Z)
      if (/^[a-z]{1}$/.test(key)) {
        setGuesses((prev) => {
          const updated = [...prev];
          if (updated[currentRow].length < WORD_LENGTH) {
            updated[currentRow] += key;
          }
          return updated;
        });
      }

      // Delete
      if (key == "backspace") {
        setGuesses((prev) => {
          const updated = [...prev];
          updated[currentRow] = updated[currentRow].slice(0, -1);
          return updated;
        });
      }

      // Submit
      if (key == "enter") {
        if (guesses[currentRow].length === WORD_LENGTH) {
          const evaluation = [];

          guesses[currentRow].split("").forEach((character, index) => {
            if (character === word[index]) {
              console.log("Character match: ", character);
              evaluation.push(1);
            } else if (word.includes(character)) {
              console.log("Near match: ", character);
              evaluation.push(2);
            } else {
              console.log("No match: ", character);
              evaluation.push(3);
            }
          });

          setEvaluations((prev) => {
            const updated = [...prev];
            updated[currentRow] = evaluation;
            return updated;
          });

          setCurrentRow((prev) => prev + 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guesses, currentRow, word]);

  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-2">
          {Array.from({ length: NUM_ROWS }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
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
                    {letter}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
