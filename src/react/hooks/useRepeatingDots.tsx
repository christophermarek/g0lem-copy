import { useReducer, useEffect } from 'react';

export const useRepeatingDots = () => {
  const [dots, addDot] = useReducer((state) => (state + 1) % 6, 1);
  // set your intervals inside useEffect
  useEffect(() => {
    const interval = window.setInterval(() => {
      addDot();
    }, 200);
    // remember to clear intervals
    return () => clearInterval(interval);
  }, [addDot]);

  return { dots: '.'.repeat(dots === 0 ? 1 : dots) };
};
