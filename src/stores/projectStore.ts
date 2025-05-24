import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '@/types';

interface ProjectState {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  resetProjects: () => void;
  loadProjects: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  
  addProject: (project) => {
    const id = uuidv4();
    const newProject: Project = {
      id,
      ...project,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => {
      const updatedProjects = [...state.projects, newProject];
      localStorage.setItem('workflowr-projects', JSON.stringify(updatedProjects));
      return { projects: updatedProjects };
    });
    
    return id;
  },
  
  updateProject: (id, projectData) => {
    set(state => {
      const updatedProjects = state.projects.map(project => 
        project.id === id 
          ? { ...project, ...projectData, updatedAt: new Date() } 
          : project
      );
      
      localStorage.setItem('workflowr-projects', JSON.stringify(updatedProjects));
      return { projects: updatedProjects };
    });
  },
  
  deleteProject: (id) => {
    set(state => {
      const updatedProjects = state.projects.filter(project => project.id !== id);
      localStorage.setItem('workflowr-projects', JSON.stringify(updatedProjects));
      return { projects: updatedProjects };
    });
  },
  
  getProject: (id) => {
    return get().projects.find(project => project.id === id);
  },
  
  resetProjects: () => {
    localStorage.removeItem('workflowr-projects');
    set({ projects: [] });
  },
  
  loadProjects: () => {
    try {
      const storedProjects = localStorage.getItem('workflowr-projects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        // Convert string dates back to Date objects
        const projectsWithDates = parsedProjects.map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        }));
        set({ projects: projectsWithDates });
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  }
}));