
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SPEECH_TIMES = [
  { label: 'AC (6:00)', seconds: 360 },
  { label: 'CX (3:00)', seconds: 180 },
  { label: 'NC (7:00)', seconds: 420 },
  { label: '1AR (4:00)', seconds: 240 },
  { label: '2NR (6:00)', seconds: 360 },
  { label: '2AR (3:00)', seconds: 180 },
  { label: 'Prep (4:00)', seconds: 240 },
];

export function DebateTimer() {
  const [timeLeft, setTimeLeft] = useState(360);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = useCallback((seconds: number = 360) => {
    setIsActive(false);
    setTimeLeft(seconds);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-full border border-border shrink-0">
      <TimerIcon className="h-4 w-4 text-primary" />
      <span className={`font-code font-bold w-12 text-center ${timeLeft < 30 ? 'text-destructive' : 'text-foreground'}`}>
        {formatTime(timeLeft)}
      </span>
      
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTimer}>
        {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <RotateCcw className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {SPEECH_TIMES.map((time) => (
            <DropdownMenuItem key={time.label} onClick={() => resetTimer(time.seconds)}>
              {time.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
