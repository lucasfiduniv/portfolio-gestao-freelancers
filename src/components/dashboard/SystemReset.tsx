import React, { useState } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { useTimerStore } from '@/stores/timerStore';
import { useToast } from '@/hooks/use-toast';

export function SystemReset() {
  const [open, setOpen] = useState(false);
  const resetProjects = useProjectStore((state) => state.resetProjects);
  const resetTasks = useTaskStore((state) => state.resetTasks);
  const resetTimers = useTimerStore((state) => state.resetTimers);
  const { toast } = useToast();

  const handleReset = () => {
    resetProjects();
    resetTasks();
    resetTimers();
    localStorage.clear();
    
    toast({
      title: "Sistema resetado",
      description: "Todos os dados foram removidos com sucesso.",
    });
    
    setOpen(false);
    
    // Reload the page after a brief delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
        >
          <Trash className="h-4 w-4 mr-2" />
          Resetar Sistema
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso removerá permanentemente todos os seus
            projetos, tarefas e registros de tempo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>
            Confirmar Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}