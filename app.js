import React, { useState } from 'react';

const questions = [
  {
    id: 1,
    text: "A player who is in the air when they catch the ball is considered to be in the same location as where they last touched the floor.",
    answer: true,
    reference: "Rule 4, Section 3, Art. 1",
    category: "Player Location"
  },
  // More questions would be loaded here
];

export default function RefereeQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (choice) => {
    setSelectedAnswer(choice);
    setIsCorrect(choice === currentQuestion.answer);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    // In a real app, this would fetch the next ID
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Header & Category */}
        <div className="flex justify-between items-center text-sm font-semibold text-orange-600 uppercase tracking-wide">
          <span>{currentQuestion.category}</span>
          <span>Question {currentIndex + 1}</span>
        </div>

        {/* The Question */}
        <h2 className="text-xl font-bold text-gray-800 leading-tight">
          {currentQuestion.text}
        </h2>

        {/* T/F Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer(true)}
            disabled={selectedAnswer !== null}
            className={`py-4 rounded-lg font-bold transition-all ${
              selectedAnswer === true ? 'ring-4 ring-blue-300' : ''
            } bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50`}
          >
            TRUE
          </button>
          <button
            onClick={() => handleAnswer(false)}
            disabled={selectedAnswer !== null}
            className={`py-4 rounded-lg font-bold transition-all ${
              selectedAnswer === false ? 'ring-4 ring-blue-300' : ''
            } bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
          >
            FALSE
          </button>
        </div>

        {/* Feedback Area */}
        {selectedAnswer !== null && (
          <div className={`p-4 rounded-lg animate-in fade-in duration-500 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p className="text-sm text-gray-600 mt-2 italic">
              Reference: {currentQuestion.reference}
            </p>
            <button 
              onClick={nextQuestion}
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded font-semibold hover:bg-gray-900"
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
