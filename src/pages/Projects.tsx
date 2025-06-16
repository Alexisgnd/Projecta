import React, { useEffect, useState } from 'react';
import './Projects.css';
import Text from '../components/Text';
import ProjectCard from '../components/ProjectCard';
import supabase from '../supabaseClient';

interface Project {
    id: number;
    user_id: string;
    created_at: string;
    name: string;
    progression: number;
    color: string;
    num_tasks: number;
    num_members: number;
}

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*');
            if (!error && data) {
                setProjects(data);
            }
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
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 24 }}>
                        {projects.map((project) => {
                            const maxAvatars = 3;
                            const avatarImages = [
                                '/assets/avatar1.png',
                                '/assets/avatar2.png',
                                '/assets/avatar3.png',
                                '/assets/avatar4.png',
                                '/assets/avatar5.png'
                            ];
                            const members = Array.from({ length: Math.min(project.num_members, maxAvatars) }, (_, i) => avatarImages[i % avatarImages.length]);
                            const extraMembers = project.num_members > maxAvatars ? project.num_members - maxAvatars : 0;

                            return (
                                <ProjectCard
                                    key={project.id}
                                    title={project.name}
                                    tasks={project.num_tasks}
                                    progress={project.progression}
                                    members={members}
                                    extraMembers={extraMembers}
                                    backgroundColor={project.color}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Projects;