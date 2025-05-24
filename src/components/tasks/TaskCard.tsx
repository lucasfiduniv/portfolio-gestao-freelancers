import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Task } from '@/types';
import { formatHours } from '@/lib/utils';
import { TaskTimer } from './TaskTimer';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, Clock } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };
  
  // Progress calculation
  let progress = 0;
  if (task.timeEstimated > 0) {
    progress = Math.min(100, Math.round((task.timeSpent / task.timeEstimated) * 100));
  } else if (task.timeSpent > 0) {
    progress = 100; // If no estimate but time spent, show 100%
  }
  
  const progressBarColor = 
    progress < 60 ? "bg-green-500" :
    progress < 90 ? "bg-yellow-500" :
    "bg-red-500";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="mb-3 cursor-grab active:cursor-grabbing">
          <CardHeader className="p-3 pb-0 flex flex-row justify-between items-start">
            <div className="font-medium">{task.name}</div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 w-7 p-0">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 w-7 p-0">
                <Trash className="h-4 w-4" />
                <span className="sr-only">Excluir</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {task.description}
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Estimado: {formatHours(task.timeEstimated)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Realizado: {formatHours(task.timeSpent)}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            {(task.timeEstimated > 0 || task.timeSpent > 0) && (
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full ${progressBarColor}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            
            <div className="mt-3">
              <TaskTimer task={task} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}