import React, { useState, useCallback } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTimerStore } from '@/stores/timerStore';
import { useToast } from '@/hooks/use-toast';

interface TaskBoardProps {
  projectId: string;
}

interface TaskColumn {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
  icon: React.ReactNode;
}

export function TaskBoard({ projectId }: TaskBoardProps) {
  const project = useProjectStore(state => state.getProject(projectId));
  const tasks = useTaskStore(state => state.getTasksByProject(projectId));
  const updateTaskStatus = useTaskStore(state => state.updateTaskStatus);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const deleteTimersForTask = useTimerStore(state => state.deleteTimersForTask);
  
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Configure dnd sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const taskColumns: TaskColumn[] = [
    {
      id: 'pendente',
      title: 'Pendentes',
      status: 'pendente',
      tasks: tasks.filter(task => task.status === 'pendente'),
      color: 'bg-yellow-500',
      icon: <div className="h-2 w-2 rounded-full bg-yellow-500" />,
    },
    {
      id: 'em_andamento',
      title: 'Em Andamento',
      status: 'em_andamento',
      tasks: tasks.filter(task => task.status === 'em_andamento'),
      color: 'bg-blue-500',
      icon: <div className="h-2 w-2 rounded-full bg-blue-500" />,
    },
    {
      id: 'concluida',
      title: 'Concluídas',
      status: 'concluida',
      tasks: tasks.filter(task => task.status === 'concluida'),
      color: 'bg-green-500', 
      icon: <div className="h-2 w-2 rounded-full bg-green-500" />,
    },
  ];

  const handleAddTask = useCallback(() => {
    setEditingTask(undefined);
    setTaskFormOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setDeletingTaskId(taskId);
  }, []);

  const confirmDeleteTask = useCallback(() => {
    if (!deletingTaskId) return;
    
    deleteTimersForTask(deletingTaskId);
    deleteTask(deletingTaskId);
    setDeletingTaskId(null);
    
    toast({
      title: "Tarefa excluída",
      description: "A tarefa foi excluída com sucesso."
    });
  }, [deletingTaskId, deleteTask, deleteTimersForTask, toast]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const targetColumn = over.id as string;
      
      // If dropping onto a column
      if (taskColumns.map(col => col.id).includes(targetColumn)) {
        updateTaskStatus(taskId, targetColumn as TaskStatus);
        
        toast({
          title: "Status atualizado",
          description: `Tarefa movida para ${
            targetColumn === 'pendente' ? 'Pendentes' : 
            targetColumn === 'em_andamento' ? 'Em Andamento' : 
            'Concluídas'
          }`
        });
      }
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">Projeto não encontrado</h3>
          <p className="text-muted-foreground">Este projeto não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddTask} className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {taskColumns.map(column => (
            <div key={column.id} className="flex flex-col h-full">
              <div className="mb-2 flex items-center">
                <div className={`h-3 w-3 rounded-full ${column.color.replace('bg-', 'bg-')} mr-2`} />
                <h3 className="font-medium text-sm">{column.title}</h3>
                <div className="ml-2 bg-secondary text-secondary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {column.tasks.length}
                </div>
              </div>
              
              <div 
                className="bg-secondary/20 p-3 rounded-lg flex-1 min-h-[200px]"
                data-droppable-id={column.id}
              >
                <SortableContext 
                  items={column.tasks.map(task => task.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {column.tasks.length > 0 ? (
                    column.tasks.map(task => (
                      <TaskCard 
                        key={task.id}
                        task={task}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-8">
                      Nenhuma tarefa
                    </div>
                  )}
                </SortableContext>
              </div>
            </div>
          ))}
        </div>
      </DndContext>
      
      <TaskForm 
        open={taskFormOpen} 
        onOpenChange={setTaskFormOpen} 
        projectId={projectId}
        initialData={editingTask}
      />
      
      <AlertDialog open={!!deletingTaskId} onOpenChange={(open) => !open && setDeletingTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a tarefa
              e todos os registros de tempo associados a ela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}