import React, { useEffect, useState } from 'react';
import './Projects.css';
import Text from '../components/Text';
import ProjectCard from '../components/ProjectCard';
import supabase from '../supabaseClient';
import ProjectOverlay from '../components/ProjectOverlay';

interface Project {
    id: number;
    user_id: number;
    created_at: string;
    name: string;
    progression: number;
    color: string;
    num_tasks: number;
    num_members: number;
    members?: any[];
}

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);

            // 1. Récupère l'utilisateur courant
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) {
                setLoading(false);
                return;
            }

            // 2. Récupère son id
            const { data: userData } = await supabase
                .from('users')
                .select('id')
                .eq('email', user.email)
                .single();
            const userId = userData?.id;
            if (!userId) {
                setLoading(false);
                return;
            }

            // 3. Récupère tous les project_ids où il est membre (table project_members)
            const { data: memberLinks } = await supabase
                .from('project_members')
                .select('project_id')
                .eq('user_id', userId);

            const memberProjectIds = (memberLinks || []).map((m: any) => m.project_id);

            let projects: Project[] = [];
            if (memberProjectIds.length > 0) {
                // 4. Récupère les projets correspondants
                const { data: projectsData } = await supabase
                    .from('projects')
                    .select('*')
                    .in('id', memberProjectIds);
                projects = projectsData || [];
            }

            // 5. Pour chaque projet, récupère les membres (avatars)
            const { data: membersData } = await supabase
                .from('project_members')
                .select('project_id, user_id')
                .in('project_id', memberProjectIds);

            const userIds = [...new Set((membersData || []).map(m => m.user_id))];
            let usersMap: Record<number, any> = {};
            if (userIds.length > 0) {
                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, picture_url')
                    .in('id', userIds);
                usersMap = Object.fromEntries((usersData || []).map(u => [u.id, u]));
            }

            const projectsWithMembers = projects.map(project => {
                const members = (membersData || [])
                    .filter(m => m.project_id === project.id)
                    .map(m => usersMap[m.user_id]?.picture_url || '/assets/avatar1.png');
                return { ...project, members };
            });

            setProjects(projectsWithMembers);
            setLoading(false);
        };
        fetchProjects();
    }, []);

    return (
        <div className="projects-root">
            <div className="projects-container">
                <Text size={32} bold color="primary">
                    Projets
                </Text>
                <Text size={16} color="secondary">
                    Vous avez {projects.length} projet{projects.length > 1 ? 's' : ''}
                </Text>
                {loading ? (
                    <Text size={18} color="secondary">Chargement...</Text>
                ) : projects.length === 0 ? (
                    <Text size={18} color="secondary">Vous n'avez aucun projet</Text>
                ) : (
                    <div className="projects-list">
                        {projects.map((project) => {
                            const maxAvatars = 3;
                            const members = project.members?.slice(0, maxAvatars) || [];
                            const extraMembers = (project.members?.length || 0) > maxAvatars
                                ? (project.members?.length || 0) - maxAvatars
                                : 0;

                            return (
                                <div key={project.id} className="project-card-wrapper">
                                    <ProjectCard
                                        title={project.name}
                                        tasks={project.num_tasks}
                                        progress={project.progression}
                                        members={members}
                                        extraMembers={extraMembers}
                                        backgroundColor={project.color}
                                        onClick={() => setSelectedProject(project)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
                <ProjectOverlay
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            </div>
        </div>
    );
}

export default Projects;