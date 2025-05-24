import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  StopCircle, 
  Plus,
  Clock 
} from 'lucide-react';
import { useTimerStore } from '@/stores/timerStore';
import { formatHours } from '@/lib/utils';

interface TaskTimerProps {
  task: Task;
}

export function TaskTimer({ task }: TaskTimerProps) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTime, setManualTime] = useState("");
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  
  const startTimer = useTimerStore(state => state.startTimer);
  const pauseTimer = useTimerStore(state => state.pauseTimer);
  const resetTimer = useTimerStore(state => state.resetTimer);
  const isTimerRunning = useTimerStore(state => state.isTimerRunning(task.id));
  const getElapsedTime = useTimerStore(state => state.getElapsedTime);
  const addManualTime = useTimerStore(state => state.addManualTime);

  // Update timer display
  useEffect(() => {
    if (!isTimerRunning) {
      setElapsedMinutes(0);
      return;
    }
    
    const interval = setInterval(() => {
      setElapsedMinutes(getElapsedTime(task.id));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isTimerRunning, getElapsedTime, task.id]);

  const handleStartTimer = () => {
    startTimer(task.id);
  };

  const handlePauseTimer = () => {
    pauseTimer(task.id);
  };

  const handleResetTimer = () => {
    resetTimer(task.id);
  };

  const handleManualTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const minutes = parseInt(manualTime, 10);
    if (!isNaN(minutes) && minutes > 0) {
      addManualTime(task.id, minutes);
      setManualTime("");
      setShowManualInput(false);
    }
  };

  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
  };

  return (
    <div>
      {showManualInput ? (
        <form onSubmit={handleManualTimeSubmit} className="flex space-x-2">
          <Input
            type="number"
            min="1"
            placeholder="Minutos"
            value={manualTime}
            onChange={(e) => setManualTime(e.target.value)}
            className="w-24 h-8 text-sm"
          />
          <Button 
            type="submit" 
            size="sm" 
            className="h-8"
            disabled={!manualTime || parseInt(manualTime, 10) <= 0}
          >
            Adicionar
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={toggleManualInput}
          >
            Cancelar
          </Button>
        </form>
      ) : (
        <div className="flex items-center space-x-2">
          {isTimerRunning ? (
            <>
              <div className="text-sm font-medium flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {formatHours(elapsedMinutes)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseTimer}
                className="h-7 px-2"
              >
                <Pause className="h-3.5 w-3.5" />
                <span className="ml-1 text-xs">Pausar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetTimer}
                className="h-7 px-2"
              >
                <StopCircle className="h-3.5 w-3.5" />
                <span className="ml-1 text-xs">Cancelar</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartTimer}
                className="h-7 px-2"
              >
                <Play className="h-3.5 w-3.5 text-green-500" />
                <span className="ml-1 text-xs">Iniciar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleManualInput}
                className="h-7 px-2"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="ml-1 text-xs">Adicionar tempo</span>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}