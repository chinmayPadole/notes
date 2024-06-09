// useTimerManager.tsx
import { useState, useEffect } from "react";

interface Timer {
  id: number;
  delay: number;
  timeoutId: NodeJS.Timeout;
}

export const useTimerManager = () => {
  const [timers, setTimers] = useState<Timer[]>([]);

  const addTimer = (callback: () => void, delay: number): number => {
    console.log("TIMERS", timers);
    const id = Date.now();
    const timeoutId = setTimeout(() => {
      callback();
      removeTimer(id);
    }, delay);

    console.log(timeoutId);

    setTimers([{ id, delay, timeoutId }]);
    return id;
  };

  const removeTimer = (id: number) => {
    setTimers((prevTimers) => prevTimers.filter((timer) => timer.id !== id));
  };

  const clearAllTimers = () => {
    timers.forEach((timer) => clearTimeout(timer.timeoutId));
    setTimers([]);
  };

  return { timers, addTimer, removeTimer, clearAllTimers };
};
