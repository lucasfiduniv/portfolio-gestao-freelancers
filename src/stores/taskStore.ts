import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus } from '@/types';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTask: (id: string, task: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (projectId: string, status: TaskStatus) => Task[];
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskTime: (taskId: string, timeSpent: number) => void;
  resetTasks: () => void;
  loadTasks: () => void;
  deleteTasksByProject: (projectId: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  
  addTask: (task) => {
    const id = uuidv4();
    const newTask: Task = {
      id,
      ...task,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => {
      const updatedTasks = [...state.tasks, newTask];
      localStorage.setItem('workflowr-tasks', JSON.stringify(updatedTasks));
      return { tasks: updatedTasks };
    });
    
    return id;
  },
  
  updateTask: (id, taskData) => {
    set(state => {
      const updatedTasks = state.tasks.map(task => 
        task.id === id 
          ? { ...task, ...taskData, updatedAt: new Date() } 
          : task
      );
      
      localStorage.setItem('workflowr-tasks', JSON.stringify(updatedTasks));
      return { tasks: updatedTasks };
    });
  },
  
  deleteTask: (id) => {
    set(state => {
      const updatedTasks = state.tasks.filter(task => task.id !== id);
      localStorage.setItem('workflowr-tasks', JSON.stringify(updatedTasks));
      return { tasks: updatedTasks };
    });
  },
  
  getTask: (id) => {
    return get().tasks.find(task => task.id === id);
  },
  
  getTasksByProject: (projectId) => {
    return get().tasks.filter(task => task.projectId === projectId);
  },
  
  getTasksByStatus: (projectId, status) => {
    return get().tasks.filter(task => task.projectId === projectId && task.status === status);
  },
  
  updateTaskStatus: (taskId, status) => {
    set(state => {
      const updatedTasks = state.tasks.map(task => 
        task.id === taskId 
          ? { ...task, status, updatedAt: new Date() } 
          : task
      );
      
      localStorage.setItem('workflowr-tasks', JSON.stringify(updatedTasks));
      return { tasks: updatedTasks };
    });
  },
  
  updateTaskTime: (taskId, timeSpent) => {
    set(state => {
      const updatedTasks = state.tasks.map(task => 
        task.id === taskId 
          ? { ...task, timeSpent, updatedAt: new Date() } 
          : task
      );
      
      localStorage.setItem('workflowr-tasks', JSON.stringify(updatedTasks));
      return { tasks: updatedTasks };
    });
  },

  deleteTasksByProject: (projectId) => {
    set(state => {
      const updatedTasks = state.tasks.filter(task => task.projectId !== projectId);
      localStorage.setItem('workflowr-tasks', JSON.stringify(updatedTasks));
      return { tasks: updatedTasks };
    });
  },
  
  resetTasks: () => {
    localStorage.removeItem('workflowr-tasks');
    set({ tasks: [] });
  },
  
  loadTasks: () => {
    try {
      const storedTasks = localStorage.getItem('workflowr-tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        // Convert string dates back to Date objects
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }));
        set({ tasks: tasksWithDates });
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  }
}));