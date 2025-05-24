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
import { useProjectStore } from '@/stores/projectStore';
import { Project } from '@/types';

const projectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  rate: z.coerce.number().min(0, 'Valor por hora deve ser maior ou igual a zero')
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Project;
}

export function ProjectForm({ open, onOpenChange, initialData }: ProjectFormProps) {
  const { toast } = useToast();
  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      clientName: initialData.clientName,
      rate: initialData.rate
    } : {
      name: '',
      description: '',
      clientName: '',
      rate: 0
    }
  });

  function onSubmit(data: ProjectFormValues) {
    try {
      if (initialData) {
        updateProject(initialData.id, data);
        toast({
          title: "Projeto atualizado",
          description: "O projeto foi atualizado com sucesso!"
        });
      } else {
        addProject(data);
        toast({
          title: "Projeto criado",
          description: "O novo projeto foi criado com sucesso!"
        });
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o projeto.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{initialData ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
            <DialogDescription>
              {initialData 
                ? 'Edite os detalhes do projeto existente.' 
                : 'Preencha os detalhes para criar um novo projeto.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input 
                id="name"
                placeholder="Digite o nome do projeto"
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
                placeholder="Descreva brevemente o projeto"
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input 
                id="clientName"
                placeholder="Digite o nome do cliente"
                {...form.register('clientName')}
              />
              {form.formState.errors.clientName && (
                <p className="text-sm text-red-500">{form.formState.errors.clientName.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="rate">Valor por Hora (R$)</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...form.register('rate')}
              />
              {form.formState.errors.rate && (
                <p className="text-sm text-red-500">{form.formState.errors.rate.message}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Salvar Alterações' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}