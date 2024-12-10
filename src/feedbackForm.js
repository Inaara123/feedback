import React, { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from "framer-motion";
import styled, { keyframes } from 'styled-components';

// -------------------- Styled Components -------------------- //

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const rotateBorder = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: #f9fafb;
  height: 100vh;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  margin-top: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  animation: ${fadeIn} 0.5s ease forwards;
`;

const HospitalName = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const Card = styled(motion.div)`
  background: #fff;
  width: 100%;
  max-width: 400px;
  margin-top: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
  color: #333;
`;

const StarsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
`;

const StarButton = styled(motion.button)`
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  margin: 0 4px;
  outline: none;

  &:focus {
    outline: none;
  }
`;

const FeedbackTextarea = styled.textarea`
  width: 100%;
  height: 100px;
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 12px;
  font-size: 14px;
  resize: none;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 16px;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3b82f6;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: ${({disabled}) => (disabled ? '#ccc' : '#3b82f6')};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${({disabled}) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.2s;

  &:hover {
    background: ${({disabled}) => (disabled ? '#ccc' : '#2563eb')};
  }
`;

const ErrorBox = styled.div`
  background: #fee2e2;
  color: #b91c1c;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  margin-top: 24px;
  max-width: 400px;
  animation: ${fadeIn} 0.3s ease forwards;
`;

const SuccessBox = styled.div`
  background: #ecfdf5;
  color: #065f46;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  margin-top: 24px;
  max-width: 400px;
  animation: ${fadeIn} 0.3s ease forwards;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalContent = styled(motion.div)`
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  max-width: 300px;
  text-align: center;
  position: relative;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #111;
`;

const ModalText = styled.p`
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
`;

const CountdownCircle = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
`;

const SpinningBorder = styled.div`
  position: absolute;
  inset: 0;
  border: 4px solid #3b82f6;
  border-radius: 50%;
  border-top-color: transparent;
  animation: ${rotateBorder} 2s linear infinite;
`;

const CountdownNumber = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  font-size: 24px;
  align-items: center;
  justify-content: center;
  color: #333;
`;

// -------------------- Component -------------------- //

const FeedbackForm = () => {
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get('placeId');
  const hospitalId = searchParams.get('hospitalId');

  const [hospitalName, setHospitalName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [countdown, setCountdown] = useState(4);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Hospital Name
  useEffect(() => {
    if (hospitalId) {
      supabase.from('hospitals').select('name').eq('id', hospitalId).single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching hospital name:', error);
          } else if (data && data.name) {
            setHospitalName(data.name);
          }
        });
    }
  }, [hospitalId]);

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
      <PageContainer>
        <ErrorBox>{error}</ErrorBox>
      </PageContainer>
    );
  }

  if (isSubmitted) {
    return (
      <PageContainer>
        <SuccessBox>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Thank you for your feedback!</h2>
          <p style={{ fontSize: '14px' }}>We appreciate you taking the time to share your experience with us.</p>
        </SuccessBox>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <TopBar>
        <HospitalName>{hospitalName || 'Loading...'}</HospitalName>
      </TopBar>

      <Card
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y:0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Your Feedback matters a lot to us</Title>

        <StarsContainer>
          {[1, 2, 3, 4, 5].map((star) => (
            <StarButton
              key={star}
              whileTap={{ scale: 0.9 }}
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
            </StarButton>
          ))}
        </StarsContainer>

        {rating > 0 && rating < 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y:0 }}
            transition={{ duration: 0.3 }}
          >
            <FeedbackTextarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="We're sorry it wasn't perfect. Share your feedback so we can make it right!"
            />
            <SubmitButton
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </SubmitButton>
          </motion.div>
        )}
      </Card>

      <AnimatePresence>
        {showModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => window.open(`https://search.google.com/local/writereview?placeid=${placeId}`, '_blank')}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
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
                <ModalTitle>Thank You!</ModalTitle>
              </motion.div>
              <ModalText>Your support means the world to us!</ModalText>

              <CountdownCircle>
                <SpinningBorder />
                <CountdownNumber>{countdown}</CountdownNumber>
              </CountdownCircle>

              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google" 
                  style={{ width: '20px', height: '20px' }}
                />
                <p style={{ fontSize: '14px', color: '#333' }}>Redirecting to Google Reviews...</p>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default FeedbackForm;
