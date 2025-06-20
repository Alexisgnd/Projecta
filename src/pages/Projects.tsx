import React, { useState, useEffect, useCallback } from "react";
import './Projects.css';
import Text from '../components/Elements/Text';
import ProjectCard from '../components/Projets/ProjectCard';
import supabase from '../supabaseClient';
import ProjectOverlay from '../components/Projets/ProjectOverlay';
import Button from '../components/Buttons/Button';
import ProjectCreateModal from '../components/Modals/ProjectCreateModal';
import NotificationButton from '../components/Buttons/NotificationButton';
import NotificationsModal from '../components/Modals/NotificationsModal';
import ProjectDetailsModal from '../components/Modals/ProjectDetailsModal';

interface Project {
    id: number;
    user_id: number;
    created_at: string;
    name: string;
    progression: number;
    color: string;
    members?: any[];
}

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
    const [projectDetails, setProjectDetails] = useState<any>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

    // Déplace fetchProjects ici pour pouvoir le passer en prop
    const fetchProjects = useCallback(async () => {
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
    }, []);

    // Récupère les notifications de l'utilisateur courant
    const fetchNotifications = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
            setNotifications([]);
            return;
        }
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();
        const userId = userData?.id;
        if (!userId) {
            setNotifications([]);
            return;
        }
        const { data } = await supabase
            .from('notifs')
            .select('id, title, content, created_at, read, type, project_response, project_id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        setNotifications(data || []);
    }, []);

    // Rafraîchit le nombre de notifications non lues très souvent (ex: toutes les 10s)
    useEffect(() => {
        fetchNotifications(); // Initial fetch
        const interval = setInterval(() => {
            fetchNotifications();
        }, 60000); // 60 secondes
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleNotifClick = async () => {
        await fetchNotifications();
        setShowNotifModal(true);
    };

    const handleProjectResponse = async (notifId: number, response: "accepted" | "refused") => {
        // Récupère la notif concernée
        const notif = notifications.find(n => n.id === notifId);
        if (!notif) return;

        // Récupère l'utilisateur courant
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) return;

        // Récupère son id numérique
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();
        const userId = userData?.id;
        if (!userId) return;

        // Si accepté, ajoute dans project_members
        if (response === "accepted" && notif.project_id) {
            await supabase
                .from('project_members')
                .insert([{ project_id: notif.project_id, user_id: userId, role: "Membre" }]);
        }

        // Mets à jour la notif
        await supabase
            .from('notifs')
            .update({ project_response: response, read: true })
            .eq('id', notifId);

        setNotifications(notifications =>
            notifications.map(n =>
                n.id === notifId
                    ? { ...n, project_response: response, read: true }
                    : n
            )
        );

        // Rafraîchit la liste des projets si accepté
        if (response === "accepted") {
            fetchProjects();
        }
    };

    const handleFriendsResponse = async (notifId: number, response: "accepted" | "refused") => {
        // Mets à jour la notif
        await supabase
            .from('notifs')
            .update({ friends_response: response, read: true })
            .eq('id', notifId);

        setNotifications(notifications =>
            notifications.map(n =>
                n.id === notifId
                    ? { ...n, friends_response: response, read: true }
                    : n
            )
        );

        // Si accepté, ajoute dans user_friends
        if (response === "accepted") {
            const notif = notifications.find(n => n.id === notifId);
            if (notif && notif.sender_email && currentUserEmail) {
                await supabase
                    .from('user_friends')
                    .insert([
                        { user_email: currentUserEmail, friend_email: notif.sender_email },
                        { user_email: notif.sender_email, friend_email: currentUserEmail }
                    ]);
            }
        }
    };

    // Rafraîchit à l'ouverture de la page
    useEffect(() => {
        fetchProjects();

        // Rafraîchit quand on revient sur l'onglet
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                fetchProjects();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [fetchProjects]);

    // Supprimer une notification
    const handleDeleteNotif = async (id: number) => {
        await supabase.from('notifs').delete().eq('id', id);
        setNotifications(notifications => notifications.filter(n => n.id !== id));
    };

    // Tout supprimer
    const handleDeleteAllNotifs = async () => {
        if (notifications.length === 0) return;
        const ids = notifications.map(n => n.id);
        await supabase.from('notifs').delete().in('id', ids);
        setNotifications([]);
    };

    // Marquer comme vue
    const handleMarkAsRead = async (id: number) => {
        await supabase.from('notifs').update({ read: true }).eq('id', id);
        setNotifications(notifications =>
            notifications.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    // Voir détails (ici simple alert, à remplacer par une vraie modale si besoin)
    const handleShowNotifDetails = (notif: any) => {
        alert(`Titre : ${notif.title}\n\n${notif.content}`);
    };

    const handleShowProjectDetails = async (projectId: number) => {
        if (!projectId) return;
        const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();
        setProjectDetails(data);
        setShowProjectDetailsModal(true);
    };

    useEffect(() => {
        const fetchCurrentUserEmail = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserEmail(user?.email || null);
        };
        fetchCurrentUserEmail();
    }, []);

    return (
        <div className="projects-root">
            <div className="projects-container">
                {/* Ligne titre + bouton */}
                <div className="projects-header-row">
                    <Text size={32} bold color="primary">
                        Projets
                    </Text>
                    <Button
                        text="Nouveau projet"
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                    />
                </div>
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
                    onProjectChanged={fetchProjects}
                />
                {showCreateModal && (
                    <ProjectCreateModal
                        onClose={() => setShowCreateModal(false)}
                        onCreated={newProject => {
                            setProjects(prev => [...prev, newProject]);
                            setShowCreateModal(false);
                        }}
                    />
                )}
                {showProjectDetailsModal && projectDetails && (
                    <ProjectDetailsModal
                        project={projectDetails}
                        onClose={() => setShowProjectDetailsModal(false)}
                    />
                )}
            </div>
            <NotificationButton
                count={notifications.filter(n => !n.read).length}
                onClick={handleNotifClick}
            />
            {showNotifModal && (
                <NotificationsModal
                    notifications={notifications}
                    onClose={() => setShowNotifModal(false)}
                    onDelete={handleDeleteNotif}
                    onDeleteAll={handleDeleteAllNotifs}
                    onMarkAsRead={handleMarkAsRead}
                    onShowDetails={handleShowNotifDetails}
                    onProjectResponse={handleProjectResponse}
                    onShowProjectDetails={handleShowProjectDetails}
                    onFriendsResponse={handleFriendsResponse}
                    onShowUserDetails={function (): void {throw new Error("Function not implemented.");}}
                    // onShowUserDetails={handleShowUserDetails}
                />
            )}
        </div>
    );
};

export default Projects;