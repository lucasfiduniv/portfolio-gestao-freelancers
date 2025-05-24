'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { useProjectStore } from '@/stores/projectStore';
import { Project } from '@/types';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTaskStore } from '@/stores/taskStore';
import { useToast } from '@/hooks/use-toast';

export default function ProjectsPage() {
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  
  const { projects, loadProjects, deleteProject } = useProjectStore();
  const { deleteTasksByProject } = useTaskStore();
  const { toast } = useToast();
  
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);
  
  const handleAddProject = () => {
    setEditingProject(undefined);
    setProjectFormOpen(true);
  };
  
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormOpen(true);
  };
  
  const handleDeleteProject = (projectId: string) => {
    setDeletingProjectId(projectId);
  };
  
  const confirmDeleteProject = () => {
    if (!deletingProjectId) return;
    
    deleteTasksByProject(deletingProjectId);
    deleteProject(deletingProjectId);
    setDeletingProjectId(null);
    
    toast({
      title: "Projeto excluído",
      description: "O projeto foi excluído com sucesso.",
    });
  };
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer 
      title="Projetos" 
      description="Gerencie seus projetos e tarefas"
      actions={
        <Button onClick={handleAddProject}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      }
    >
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-primary/10 p-3 rounded-full">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Nenhum projeto encontrado</h3>
          <p className="mt-1 text-center text-muted-foreground max-w-sm">
            {searchQuery 
              ? "Tente mudar os termos da busca ou limpar o filtro"
              : "Crie seu primeiro projeto para começar a gerenciar seu trabalho"}
          </p>
          {!searchQuery && (
            <Button onClick={handleAddProject} className="mt-4">
              Criar Projeto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onEdit={() => handleEditProject(project)}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </div>
      )}
      
      <ProjectForm 
        open={projectFormOpen} 
        onOpenChange={setProjectFormOpen}
        initialData={editingProject}
      />
      
      <AlertDialog open={!!deletingProjectId} onOpenChange={(open) => !open && setDeletingProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto
              e todas as tarefas associadas a ele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProject}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}