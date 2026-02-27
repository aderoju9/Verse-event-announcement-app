import { useState, useEffect } from 'react';
import { getCountdown } from '../utils/dateHelpers';

interface CountdownTimerProps {
  targetDate: string;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(getCountdown(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getCountdown(targetDate);
      setTimeLeft(remaining);
      
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 text-sm font-mono text-blue-600 bg-blue-600/10 px-2 py-1 rounded-md border border-blue-600/20">
      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
      <span>Starts in: {timeLeft}</span>
    </div>
  );
}
