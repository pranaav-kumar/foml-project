import React from 'react';

const ResultPage = ({ result, onRestart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 max-w-2xl w-full animate-fade-in">
        <div className="text-center">
          <div className="text-7xl sm:text-8xl mb-6 animate-bounce">🎉</div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
            You are a
          </h1>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {result.travelerType}
            </h2>
          </div>

          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
