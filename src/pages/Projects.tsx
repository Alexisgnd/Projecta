import React, { useEffect, useState } from 'react';
import './Projects.css';
import Text from '../components/Text';
import ProjectCard from '../components/ProjectCard';
import supabase from '../supabaseClient';
import { motion, AnimatePresence } from "framer-motion";

interface Project {
    id: number;
    user_id: number;
    created_at: string;
    name: string;
    progression: number;
    color: string;
    num_tasks: number;
    num_members: number;
    members?: any[]; // Ajoute cette propriété pour stocker les membres
}

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            const { data: projectsData, error } = await supabase
                .from('projects')
                .select('*');
            if (error || !projectsData) {
                setLoading(false);
                return;
            }

            // 2. Pour chaque projet, récupère les membres (user_id)
            const projectIds = projectsData.map(p => p.id);
            const { data: membersData } = await supabase
                .from('project_members')
                .select('project_id, user_id')
                .in('project_id', projectIds);

            // 3. Récupère les infos utilisateurs pour tous les membres uniques
            const userIds = [...new Set((membersData || []).map(m => m.user_id))];
            let usersMap: Record<number, any> = {};
            if (userIds.length > 0) {
                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, picture_url')
                    .in('id', userIds);
                usersMap = Object.fromEntries((usersData || []).map(u => [u.id, u]));
            }

            // 4. Associe les avatars à chaque projet
            const projectsWithMembers = projectsData.map(project => {
                const members = (membersData || [])
                    .filter(m => m.project_id === project.id)
                    .map(m => usersMap[m.user_id]?.picture_url || '/assets/avatar1.png'); // fallback si pas d'avatar
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
                {/* Overlay animé : DOIT ÊTRE ICI */}
                <AnimatePresence>
                    {selectedProject && (
                        <motion.div
                            className="project-expand-overlay"
                            initial={{ borderRadius: 32, scale: 0.9, opacity: 0 }}
                            animate={{
                                borderRadius: 0,
                                scale: 1,
                                opacity: 1,
                            }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            style={{
                                background: selectedProject.color || "#a259ff",
                            }}
                            onClick={() => setSelectedProject(null)}
                        >
                            <div className="project-expand-content" onClick={e => e.stopPropagation()}>
                                <Text size={40} bold>
                                    {selectedProject.name}
                                </Text>
                                <div className="project-expand-details">
                                    <Text size={20}>
                                        {selectedProject.num_tasks} tâche{selectedProject.num_tasks > 1 ? "s" : ""}
                                    </Text>
                                    <Text size={20}>
                                        Progression : {selectedProject.progression}%
                                    </Text>
                                </div>
                                <button
                                    className="project-expand-close"
                                    onClick={() => setSelectedProject(null)}
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Projects;