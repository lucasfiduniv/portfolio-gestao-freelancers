import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useTaskStore } from '@/stores/taskStore';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const tasks = useTaskStore(state => state.getTasksByProject(project.id));
  const completedTasks = tasks.filter(task => task.status === 'concluida').length;
  
  const totalMinutesSpent = tasks.reduce((acc, task) => acc + task.timeSpent, 0);
  const hoursSpent = Math.floor(totalMinutesSpent / 60);
  const minutesSpent = totalMinutesSpent % 60;
  
  // Calculate potential earnings based on time spent and hourly rate
  const earnings = (totalMinutesSpent / 60) * project.rate;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                Cliente: {project.clientName}
              </div>
            </div>
            <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
              {formatCurrency(project.rate)}/h
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
          
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Tarefas</span>
                <span className="font-medium">{completedTasks}/{tasks.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Tempo Total</span>
                <span className="font-medium flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {hoursSpent}h {minutesSpent}m
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Criado em</span>
                <span className="font-medium">{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Faturamento</span>
                <span className="font-medium">{formatCurrency(earnings)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              Excluir
            </Button>
          </div>
          <Link href={`/projetos/${project.id}`}>
            <Button size="sm">
              Detalhes
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}