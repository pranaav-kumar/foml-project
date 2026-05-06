import React, { useState } from 'react';
import { apiService } from '../services/api.service';
import ResultPage from './ResultPage';

const TravelQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const questionMapping = {
    q1: 'q1_activity',
    q2: 'q2_destination',
    q3: 'q3_pace',
    q4: 'q4_accommodation',
    q5: 'q5_souvenir',
    q6: 'q6_evening',
    q7: 'q7_motivation',
  };

  const questions = [
    {
      id: 'q1',
      question: 'What kind of activities excite you the most during a trip?',
      purpose: 'Finds main interest',
      options: [
        { emoji: '🏛️', text: 'Visiting museums / monuments' },
        { emoji: '🏔️', text: 'Hiking or adventure sports' },
        { emoji: '🍜', text: 'Exploring local cuisine' },
        { emoji: '🌳', text: 'Nature walks or beaches' },
        { emoji: '🛍️', text: 'Shopping / city exploration' },
        { emoji: '🕉️', text: 'Visiting temples / spiritual places' },
        { emoji: '🏖️', text: 'Relaxing on a beach' },
      ],
    },
    {
      id: 'q2',
      question: 'What type of destinations attract you most?',
      purpose: 'Identifies goal',
      options: [
        { emoji: '🏛️', text: 'Heritage sites' },
        { emoji: '⛰️', text: 'Mountains' },
        { emoji: '🌳', text: 'Forests' },
        { emoji: '🏖️', text: 'Beaches' },
        { emoji: '🏙️', text: 'Cities' },
        { emoji: '🏘️', text: 'Villages' },
      ],
    },
    {
      id: 'q3',
      question: 'What kind of travel pace do you prefer?',
      purpose: 'Measures energy level',
      options: [
        { emoji: '😎', text: 'Relaxed and slow' },
        { emoji: '⚖️', text: 'Balanced with some activity' },
        { emoji: '🔥', text: 'Always on the move and adventurous' },
      ],
    },
    {
      id: 'q4',
      question: 'What kind of accommodation do you like?',
      purpose: 'Lifestyle clue',
      options: [
        { emoji: '🏨', text: 'Luxury resorts' },
        { emoji: '🏕️', text: 'Budget hostels' },
        { emoji: '🏡', text: 'Homestays / local inns' },
        { emoji: '🏖️', text: 'Beachside cottages' },
      ],
    },
    {
      id: 'q5',
      question: 'What kind of souvenirs or memories do you bring back?',
      purpose: 'Cultural vs experiential',
      options: [
        { emoji: '🎁', text: 'Handicrafts / art' },
        { emoji: '📸', text: 'Photos of nature & adventure' },
        { emoji: '🍪', text: 'Local snacks / food items' },
        { emoji: '💍', text: 'City shopping items' },
      ],
    },
    {
      id: 'q6',
      question: "What's your ideal way to spend an evening on vacation?",
      purpose: 'Mood clue',
      options: [
        { emoji: '🍷', text: 'Romantic dinner by the sea' },
        { emoji: '🔥', text: 'Campfire or trek' },
        { emoji: '🕍', text: 'Exploring temples' },
        { emoji: '🍢', text: 'Trying street food' },
        { emoji: '🛍️', text: 'Night market shopping' },
        { emoji: '🏖️', text: 'Relaxing on the beach' },
        { emoji: '🏬', text: 'Shopping in city malls' },
      ],
    },
    {
      id: 'q7',
      question: 'What motivates you most to travel?',
      purpose: 'Core intent',
      options: [
        { emoji: '🧭', text: 'Discover new cultures' },
        { emoji: '🎢', text: 'Adventure & thrill' },
        { emoji: '🧘‍♀️', text: 'Peace / spiritual connection' },
        { emoji: '👨‍👩‍👧‍👦', text: 'Family bonding' },
        { emoji: '❤️', text: 'Romantic time' },
        { emoji: '💸', text: 'Exploring more with less (budget travel)' },
        { emoji: '🍽️', text: 'Food discovery' },
        { emoji: '🛍️', text: 'Urban life / shopping' },
        { emoji: '😌', text: 'Relaxation' },
      ],
    },
  ];

  const handleAnswer = async (optionText) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: optionText };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // All questions answered, make prediction
      setLoading(true);
      setError(null);

      try {
        // Map frontend answers to backend format
        const backendAnswers = {};
        Object.entries(newAnswers).forEach(([key, value]) => {
          const backendKey = questionMapping[key];
          backendAnswers[backendKey] = value;
        });

        console.log('Sending to backend:', backendAnswers);

        // Get user info from sessionStorage
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');

        // Get prediction from ML service
        const prediction = await apiService.predictTravelerType(
          backendAnswers,
          token || undefined
        );

        console.log('Received prediction:', prediction);

        // Save user profile with traveler type
        if (userId) {
          const profileData = {
            userId: userId,
            travelerType: prediction.travelerType,
            confidence: prediction.confidence,
            description: prediction.description,
          };

          const saveResult = await apiService.saveUserProfile(profileData, token || undefined);
          console.log('✅ Profile saved:', saveResult);

          // Store traveler type in sessionStorage for easy access
          sessionStorage.setItem('travelerType', prediction.travelerType);
          sessionStorage.setItem('travelerConfidence', prediction.confidence.toString());
        } else {
          console.warn('⚠️ No userId found in sessionStorage. Profile not saved.');
        }

        setResult(prediction);
      } catch (err) {
        console.error('Error predicting traveler type:', err);
        setError(err.message || 'Failed to get prediction. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRestart}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return <ResultPage result={result} onRestart={handleRestart} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">Analyzing your preferences...</h2>
          <p className="text-gray-600 mt-2">Finding your perfect travel personality</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 max-w-4xl w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Discover Your Travel Personality
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Answer a few questions to find your perfect destination
          </p>
        </div>

        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-center text-sm font-semibold text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <div className="mb-8 animate-slide-in">
          <span className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            {questions[currentQuestion].purpose}
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 leading-snug">
            {questions[currentQuestion].question}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions[currentQuestion].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option.text)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  answers[questions[currentQuestion].id] === option.text
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-600 text-white shadow-lg'
                    : 'bg-gray-50 border-gray-200 hover:border-purple-400 text-gray-800'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <span className="text-4xl sm:text-5xl">{option.emoji}</span>
                  <span
                    className={`text-sm sm:text-base font-semibold leading-tight ${
                      answers[questions[currentQuestion].id] === option.text
                        ? 'text-white'
                        : 'text-gray-700 group-hover:text-purple-600'
                    }`}
                  >
                    {option.text}
                  </span>
                </div>

                {answers[questions[currentQuestion].id] === option.text && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {currentQuestion > 0 && (
          <div className="flex justify-start">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-purple-400 hover:text-purple-600 hover:-translate-x-1 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelQuiz;
