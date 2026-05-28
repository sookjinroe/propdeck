import { useState } from 'react';
import type { Project } from './types';
import { INITIAL_PROJECTS } from './data';
import ProjectList from './views/ProjectList';
import Workspace from './views/Workspace';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const handleEnterProject = (p: Project) => setActiveProject(p);
  const handleBackToProjects = () => setActiveProject(null);
  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setActiveProject(updated);
  };
  const handleCreateProject = (p: Project) => {
    setProjects(prev => [...prev, p]);
    setActiveProject(p);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {activeProject ? (
        <Workspace
          project={activeProject}
          onBack={handleBackToProjects}
          onUpdate={handleUpdateProject}
        />
      ) : (
        <ProjectList
          projects={projects}
          onEnter={handleEnterProject}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}
