import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// 1. Configuration
const supabaseUrl = "https://ocopkevjejseccccmvxf.supabase.co";
const supabaseAnonKey = "sb_publishable_VzexdmNc7smi7TI6-T_f5A_nIclWeTj";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  // 2. State Management
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Timer States
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerActive, setTimerActive] = useState(false);

  // 3. Hooks (The Rules: No early returns before these!)
  // 4. Game Logic
  const currentQuestion = questions[currentIndex];

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(10);
    setTimerActive(true);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  // Wrap this function in useCallback
  const handleAnswer = useCallback(
    (choice) => {
      // 1. STOPS the double-count: If we already have a selection, STOP.
      if (selectedAnswer !== null) return;

      // 2. STOP the timer immediately
      setTimerActive(false);

      // 3. Set the selection (even if it's null)
      setSelectedAnswer(choice);

      // 4. Calculate correctness
      const correct = choice !== null && choice === currentQuestion.answer;
      setIsCorrect(correct);

      // 5. Update Stats (ONLY if this is the first time we're answering this question)
      setTotalAttempted((prev) => prev + 1);
      if (correct) {
        setCorrectCount((prev) => prev + 1);
      }
    },
    [selectedAnswer, currentQuestion, setCorrectCount, setTotalAttempted]
  );

  // Fetch Questions from Supabase
  useEffect(() => {
    async function getQuestions() {
      const { data, error } = await supabase.from("questions").select("*");
      if (error) {
        console.error("Error:", error);
      } else {
        // SHUFFLE LOGIC: Sort the data randomly before saving to state
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      }
      setLoading(false);
    }
    getQuestions();
  }, []);

  // Shot Clock Countdown Logic
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0 && selectedAnswer === null) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    // ONLY trigger handleAnswer if time is 0 AND we haven't picked an answer yet
    else if (timeLeft === 0 && selectedAnswer === null && timerActive) {
      handleAnswer(null);
    }

    return () => clearInterval(timer);
  }, [timerActive, timeLeft, selectedAnswer, handleAnswer]);

  // Reset Timer when Question Changes
  useEffect(() => {
    if (!loading && questions.length > 0) {
      setTimeLeft(10);
      setTimerActive(true);
    }
  }, [currentIndex, loading, questions.length]);

  // 5. Early Returns (Safety Checks)
  if (loading)
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-[#d4af37] font-bold">
        WHISTLE BLOWING... LOADING RULES...
      </div>
    );
  if (!currentQuestion)
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white font-bold">
        NO QUESTIONS FOUND IN DATABASE.
      </div>
    );

  // 6. The "FIBA Elite" Render
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-start p-6 font-sans">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Scoreboard Card */}
        <div className="bg-[#1e1e1e] p-5 rounded-xl border border-[#333] shadow-2xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#d4af37] font-black uppercase tracking-widest text-xs">
              Session Stats
            </span>
            <span className="text-gray-400 text-sm font-medium">
              {correctCount} / {totalAttempted} (
              {totalAttempted > 0
                ? Math.round((correctCount / totalAttempted) * 100)
                : 0}
              %)
            </span>
          </div>
          <div className="w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#d4af37] h-full transition-all duration-700 ease-out shadow-[0_0_8px_#d4af37]"
              style={{
                width: `${
                  totalAttempted > 0 ? (correctCount / totalAttempted) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Main Quiz Card */}
        <div className="bg-[#1e1e1e] rounded-2xl border border-[#333] p-8 shadow-2xl flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <span className="px-3 py-1 rounded border border-[#d4af37] text-[10px] font-bold tracking-[0.2em] uppercase text-[#d4af37]">
              {currentQuestion.category || "General Rule"}
            </span>
            <div
              className={`text-3xl font-mono font-black px-3 py-1 rounded border-2 transition-all duration-300 ${
                timeLeft <= 3
                  ? "text-red-600 border-red-600 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                  : "text-[#d4af37] border-[#333]"
              }`}
            >
              {String(timeLeft).padStart(2, "0")}
            </div>
          </div>

          <h2 className="text-2xl font-light text-gray-100 leading-snug">
            {currentQuestion.question}
          </h2>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => handleAnswer(true)}
              disabled={selectedAnswer !== null || timeLeft === 0}
              className={`py-4 px-6 rounded-lg font-bold tracking-widest transition-all duration-300 border-2
                ${
                  selectedAnswer === true
                    ? "bg-[#d4af37] border-[#d4af37] text-black scale-95"
                    : timeLeft === 0 && selectedAnswer === null
                    ? "bg-transparent border-[#222] text-gray-700 opacity-30 cursor-not-allowed" // NEW: Visual lockout style
                    : "bg-transparent border-[#444] text-gray-300 hover:border-[#d4af37] hover:text-white"
                }`}
            >
              TRUE
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={selectedAnswer !== null || timeLeft === 0}
              className={`py-4 px-6 rounded-lg font-bold tracking-widest transition-all duration-300 border-2
                ${
                  selectedAnswer === true
                    ? "bg-[#d4af37] border-[#d4af37] text-black scale-95"
                    : timeLeft === 0 && selectedAnswer === null
                    ? "bg-transparent border-[#222] text-gray-700 opacity-30 cursor-not-allowed" // NEW: Visual lockout style
                    : "bg-transparent border-[#444] text-gray-300 hover:border-[#d4af37] hover:text-white"
                }`}
            >
              FALSE
            </button>
          </div>
        </div>

        {/* Feedback Area */}
        {(selectedAnswer !== null || timeLeft === 0) && (
          <div
            className={`p-6 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              isCorrect
                ? "bg-[#1e1e1e] border-green-500/50"
                : "bg-[#1e1e1e] border-red-500/50"
            }`}
          >
            <p
              className={`text-sm font-black tracking-widest uppercase mb-1 ${
                selectedAnswer === null
                  ? "text-orange-500"
                  : isCorrect
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {selectedAnswer === null && timeLeft === 0
                ? "⏲️ SHOT CLOCK VIOLATION"
                : isCorrect
                ? "Correct Decision"
                : "Incorrect Decision"}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed italic">
              <span className="text-gray-200 font-bold not-italic">
                Rule Reference:
              </span>{" "}
              {currentQuestion.reference}
            </p>
            <button
              onClick={nextQuestion}
              className="mt-6 w-full bg-white text-black py-4 rounded-lg font-black text-xs uppercase tracking-[0.3em] hover:bg-[#d4af37] transition-colors"
            >
              Next Play →
            </button>
          </div>
        )}

        {/* Suggestion Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-3 font-bold">
            Found a tricky play?
          </p>
          <a
            href="mailto:madicrowleylong@gmail.com?subject=FIBA Quiz Suggestion&body=Question: %0D%0A%0D%0AAnswer: %0D%0AReference:"
            className="inline-block border border-[#333] text-gray-500 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
          >
            Submit a Question
          </a>
        </div>
      </div>
    </div>
  );
}
