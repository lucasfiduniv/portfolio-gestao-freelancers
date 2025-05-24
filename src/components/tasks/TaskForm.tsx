import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task, TaskStatus } from '@/types';
import { useTaskStore } from '@/stores/taskStore';

const taskSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  status: z.enum(['pendente', 'em_andamento', 'concluida']),
  timeEstimated: z.coerce.number().min(0, 'Tempo estimado deve ser maior ou igual a zero')
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  initialData?: Task;
}

export function TaskForm({ open, onOpenChange, projectId, initialData }: TaskFormProps) {
  const { toast } = useToast();
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      status: initialData.status,
      timeEstimated: initialData.timeEstimated
    } : {
      name: '',
      description: '',
      status: 'pendente' as TaskStatus,
      timeEstimated: 0
    }
  });

  function onSubmit(data: TaskFormValues) {
    try {
      if (initialData) {
        updateTask(initialData.id, data);
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso!"
        });
      } else {
        addTask({
          ...data,
          projectId,
          timeSpent: 0
        });
        toast({
          title: "Tarefa criada",
          description: "A nova tarefa foi criada com sucesso!"
        });
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{initialData ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            <DialogDescription>
              {initialData 
                ? 'Edite os detalhes da tarefa existente.' 
                : 'Preencha os detalhes para criar uma nova tarefa.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Tarefa</Label>
              <Input 
                id="name"
                placeholder="Digite o nome da tarefa"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva brevemente a tarefa"
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                defaultValue={form.getValues('status')}
                onValueChange={(value) => form.setValue('status', value as TaskStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="timeEstimated">Tempo Estimado (em minutos)</Label>
              <Input
                id="timeEstimated"
                type="number"
                min="0"
                placeholder="0"
                {...form.register('timeEstimated')}
              />
              <p className="text-xs text-muted-foreground">
                Exemplo: 60 = 1h, 90 = 1h30min
              </p>
              {form.formState.errors.timeEstimated && (
                <p className="text-sm text-red-500">{form.formState.errors.timeEstimated.message}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Salvar Alterações' : 'Criar Tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}