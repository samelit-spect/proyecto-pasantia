import { useState, useCallback, useRef } from 'react';

type Feedback = { type: 'success' | 'error'; message: string } | null;

const useFeedback = (autoClearMs = 3000) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback((id: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback(null);
    setUpdatingId(id);
  }, []);

  const end = useCallback(
    (fb: Feedback) => {
      setUpdatingId(null);
      setFeedback(fb);
      if (fb?.type === 'success' && autoClearMs > 0) {
        timerRef.current = setTimeout(() => setFeedback(null), autoClearMs);
      }
    },
    [autoClearMs]
  );

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback(null);
  }, []);

  return { updatingId, feedback, start, end, clear };
};

export default useFeedback;
