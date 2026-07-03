import { useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';

/**
 * Custom hook cho Gemini AI
 */
export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [isFallback, setIsFallback] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  /**
   * Recommend products
   */
  const recommendProducts = useCallback(async (query, availableProducts) => {
    setLoading(true);
    setError(null);

    try {
      const result = await geminiService.recommendProducts(query, availableProducts);

      if (result.success) {
        setRecommendations(result.recommendedIds);
        setExplanation(result.explanation);
        setIsFallback(result.isFallback || false);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Chat with AI
   */
  const chat = useCallback(async (message, context = '') => {
    setLoading(true);
    setError(null);

    try {
      // Add user message to history
      setChatHistory((prev) => [...prev, { role: 'user', content: message }]);

      const result = await geminiService.chat(message, context);

      if (result.success) {
        // Add AI reply to history
        setChatHistory((prev) => [...prev, { role: 'ai', content: result.reply }]);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setRecommendations([]);
    setExplanation('');
    setChatHistory([]);
    setError(null);
  }, []);

  return {
    loading,
    error,
    recommendations,
    explanation,
    chatHistory,
    recommendProducts,
    chat,
    reset,
    isFallback,
  };
};