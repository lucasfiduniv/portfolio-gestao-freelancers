import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { TimeLog } from '@/types';
import { useTaskStore } from './taskStore';

interface TimerState {
  activeLogs: Record<string, TimeLog>; // taskId -> TimeLog
  timeHistory: TimeLog[];
  startTimer: (taskId: string) => void;
  pauseTimer: (taskId: string) => void;
  resetTimer: (taskId: string) => void;
  isTimerRunning: (taskId: string) => boolean;
  getElapsedTime: (taskId: string) => number; // returns minutes
  getTimeLogsForTask: (taskId: string) => TimeLog[];
  addManualTime: (taskId: string, minutes: number) => void;
  resetTimers: () => void;
  loadTimers: () => void;
  deleteTimersForTask: (taskId: string) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  activeLogs: {},
  timeHistory: [],
  
  startTimer: (taskId: string) => {
    const now = new Date();
    
    set(state => {
      // If there's already an active timer for this task, don't start a new one
      if (state.activeLogs[taskId]) {
        return state;
      }
      
      const newLog: TimeLog = {
        id: uuidv4(),
        taskId,
        startTime: now,
        duration: 0
      };
      
      const updatedActiveLogs = { 
        ...state.activeLogs,
        [taskId]: newLog 
      };
      
      return { activeLogs: updatedActiveLogs };
    });
  },
  
  pauseTimer: (taskId: string) => {
    const activeLog = get().activeLogs[taskId];
    if (!activeLog) return;
    
    const now = new Date();
    const durationInMinutes = Math.round((now.getTime() - activeLog.startTime.getTime()) / (1000 * 60));
    
    // Create a completed log
    const completedLog: TimeLog = {
      ...activeLog,
      endTime: now,
      duration: durationInMinutes
    };
    
    // Update task time
    if (durationInMinutes > 0) {
      const task = useTaskStore.getState().getTask(taskId);
      if (task) {
        const newTimeSpent = task.timeSpent + durationInMinutes;
        useTaskStore.getState().updateTaskTime(taskId, newTimeSpent);
      }
    }
    
    set(state => {
      // Remove from active logs
      const { [taskId]: _, ...remainingActiveLogs } = state.activeLogs;
      
      // Add to history
      const updatedHistory = [...state.timeHistory, completedLog];
      
      // Save to localStorage
      localStorage.setItem('workflowr-time-history', JSON.stringify(updatedHistory));
      
      return {
        activeLogs: remainingActiveLogs,
        timeHistory: updatedHistory
      };
    });
  },
  
  resetTimer: (taskId: string) => {
    set(state => {
      // Just remove from active logs without saving to history
      const { [taskId]: _, ...remainingActiveLogs } = state.activeLogs;
      return { activeLogs: remainingActiveLogs };
    });
  },
  
  isTimerRunning: (taskId: string) => {
    return !!get().activeLogs[taskId];
  },
  
  getElapsedTime: (taskId: string) => {
    const activeLog = get().activeLogs[taskId];
    if (!activeLog) return 0;
    
    const now = new Date();
    return Math.round((now.getTime() - activeLog.startTime.getTime()) / (1000 * 60));
  },
  
  getTimeLogsForTask: (taskId: string) => {
    return get().timeHistory.filter(log => log.taskId === taskId);
  },
  
  addManualTime: (taskId: string, minutes: number) => {
    if (minutes <= 0) return;
    
    const now = new Date();
    const startTime = new Date(now.getTime() - minutes * 60 * 1000);
    
    const newLog: TimeLog = {
      id: uuidv4(),
      taskId,
      startTime,
      endTime: now,
      duration: minutes
    };
    
    // Update task time
    const task = useTaskStore.getState().getTask(taskId);
    if (task) {
      const newTimeSpent = task.timeSpent + minutes;
      useTaskStore.getState().updateTaskTime(taskId, newTimeSpent);
    }
    
    set(state => {
      const updatedHistory = [...state.timeHistory, newLog];
      localStorage.setItem('workflowr-time-history', JSON.stringify(updatedHistory));
      return { timeHistory: updatedHistory };
    });
  },
  
  resetTimers: () => {
    localStorage.removeItem('workflowr-time-history');
    set({ activeLogs: {}, timeHistory: [] });
  },
  
  loadTimers: () => {
    try {
      const storedTimeHistory = localStorage.getItem('workflowr-time-history');
      if (storedTimeHistory) {
        const parsedTimeHistory = JSON.parse(storedTimeHistory);
        // Convert string dates back to Date objects
        const timeHistoryWithDates = parsedTimeHistory.map((log: any) => ({
          ...log,
          startTime: new Date(log.startTime),
          endTime: log.endTime ? new Date(log.endTime) : undefined
        }));
        set({ timeHistory: timeHistoryWithDates, activeLogs: {} });
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de tempo:', error);
    }
  },
  
  deleteTimersForTask: (taskId: string) => {
    set(state => {
      // Remove active log if exists
      const { [taskId]: _, ...remainingActiveLogs } = state.activeLogs;
      
      // Filter out time history for this task
      const filteredHistory = state.timeHistory.filter(log => log.taskId !== taskId);
      
      localStorage.setItem('workflowr-time-history', JSON.stringify(filteredHistory));
      
      return {
        activeLogs: remainingActiveLogs,
        timeHistory: filteredHistory
      };
    });
  }
}));