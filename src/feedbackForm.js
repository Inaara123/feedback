import React, { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from "framer-motion";

const FeedbackForm = () => {
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get('placeId');
  const hospitalId = searchParams.get('hospitalId');

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [countdown, setCountdown] = useState(4);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!placeId || !hospitalId) {
      setError("Invalid feedback link. Please contact the hospital for assistance.");
    }
  }, [placeId, hospitalId]);

  useEffect(() => {
    let intervalId;
    if (showModal && countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      window.open(`https://search.google.com/local/writereview?placeid=${placeId}`, '_blank');
    }
    return () => clearInterval(intervalId);
  }, [countdown, showModal, placeId]);

  const handleStarClick = async (star) => {
    setRating(star);
    if (star === 5) {
      setIsSubmitting(true);
      try {
        await supabase.from('feedback').insert({
          hospital_id: hospitalId,
          place_id: placeId,
          number_of_stars: 5,
          feedback: ''
        });
        setShowModal(true);
      } catch (error) {
        console.error('Error submitting rating:', error);
        setError("Failed to submit rating. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!rating || rating === 5) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await supabase.from('feedback').insert({
        hospital_id: hospitalId,
        place_id: placeId,
        number_of_stars: rating,
        feedback: feedback.trim()
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-8 p-4 bg-white rounded-lg shadow-md">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-lg mx-auto mt-8 p-4 bg-white rounded-lg shadow-md">
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Thank you for your feedback!</h2>
          <p>We appreciate you taking the time to share your experience with us.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-6">Your Feedback matters a lot to us</h2>
      
      <div className="flex justify-center space-x-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileTap={{ scale: 0.9 }}
            className="text-4xl focus:outline-none"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            <motion.span
              animate={{
                scale: star === rating ? [1, 1.2, 1] : 1,
                color: star <= (hoveredStar || rating) ? "#FFD700" : "#D1D5DB"
              }}
              transition={{ duration: 0.2 }}
            >
              ★
            </motion.span>
          </motion.button>
        ))}
      </div>

      {rating > 0 && rating < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your experience matters to us! We're sorry it wasn't perfect. Share your feedback so we can make it right—and ensure it doesn't happen again!"
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={() => window.open(`https://search.google.com/local/writereview?placeid=${placeId}`, '_blank')}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-8 rounded-lg shadow-xl max-w-md text-center relative"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 0.5,
                  times: [0, 0.5, 1],
                }}
              >
                <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
              </motion.div>
              
              <p className="text-lg mb-6">Your support means the world to us!</p>
              
              <div className="relative w-20 h-20 mx-auto mb-4">
                <motion.div
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 4,
                    ease: "linear",
                    repeat: Infinity
                  }}
                  className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent"
                />
                <div className="absolute inset-0 flex items-center justify-center text-xl">
                  {countdown}
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google" 
                  className="w-5 h-5"
                />
                <p>Redirecting to Google Reviews...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackForm;