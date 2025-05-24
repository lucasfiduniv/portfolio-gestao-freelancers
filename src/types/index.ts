export interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  rate: number; // Valor por hora
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida';

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: TaskStatus;
  timeEstimated: number; // em minutos
  timeSpent: number; // em minutos
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeLog {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // em minutos
}

export interface Invoice {
  id: string;
  projectId: string;
  number: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: number;
  status: 'rascunho' | 'enviada' | 'paga';
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalHours: number; // em minutos
  weeklyData: WeeklyData[];
}

export interface WeeklyData {
  day: string;
  hours: number; // em minutos
}