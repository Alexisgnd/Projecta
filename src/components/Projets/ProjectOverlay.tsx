import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Text from "../Elements/Text";
import Button from "../Buttons/Button";
import Input from "../Elements/Input";
import { FaCheck, FaTimes, FaUserPlus } from "react-icons/fa";
import "./ProjectOverlay.css";
import Alert from "../Elements/Alert";
import supabase from "../../supabaseClient";
import TagInput from "../Elements/TagInput";
import ProfilePreviewModal from "../Modals/ProfilePreviewModal";
import { UserStatusDot } from "../User Profile/UserStatus";
import Modal from "../Modals/Modal";
import ProjectOverviewTile from "./ProjectOverviewTile";
import CreateTaskModal from "../Modals/CreateTaskModal";
import ProjectTaskList from "./ProjectTaskList";
import ProjectMembersBar from "../Elements/ProjectMembersBar";

interface Project {
    id: number;
    name: string;
    color: string;
    progression: number;
    description?: string;
    tags?: string[];
    tags_colors?: { [key: string]: string };
    status?: string;
    start?: string;
    end?: string;
}

interface ProjectOverlayProps {
    project: Project | null;
    onClose: () => void;
    onProjectChanged?: () => void;
}

const ProjectOverlay: React.FC<ProjectOverlayProps> = ({ project, onClose, onProjectChanged }) => {
    const [selectedTab, setSelectedTab] = useState(0);

    // Ajout des états pour tous les champs
    const [name, setName] = useState(project?.name || "");
    const [description, setDescription] = useState(project?.description || "");
    const [progression, setProgression] = useState(project?.progression || 0);
    const [color, setColor] = useState(project?.color || "#a259ff");
    const [tags, setTags] = useState<string[]>(project?.tags || []);
    const [tagsColors, setTagsColors] = useState<{ [key: string]: string }>(project?.tags_colors || {});
    const [status, setStatus] = useState(project?.status || "");
    const [start, setStart] = useState(project?.start ? project.start.substring(0, 10) : "");
    const [end, setEnd] = useState(project?.end ? project.end.substring(0, 10) : "");

    // Remet à jour les états quand le projet change
    useEffect(() => {
        setSelectedTab(0);
        setName(project?.name || "");
        setDescription(project?.description || "");
        setProgression(project?.progression || 0);
        setColor(project?.color || "#a259ff");
        setTags(project?.tags || []);
        setTagsColors(project?.tags_colors || {});
        setStatus(project?.status || "");
        setStart(project?.start ? project.start.substring(0, 10) : "");
        setEnd(project?.end ? project.end.substring(0, 10) : "");
    }, [project]);

    // Ajoute un état pour l'alerte
    const [alert, setAlert] = useState<{
        type: "error" | "success" | "info" | "warning";
        title: string;
        message: React.ReactNode;
        key?: string;
    } | null>(null);

    // Nouvelle fonction handleSave qui envoie à Supabase
    const handleSave = async () => {
        if (!project) return;
        setAlert({
            type: "info",
            title: "Sauvegarde...",
            message: "Enregistrement des modifications en cours.",
            key: Date.now().toString(),
        });

        // Conversion des dates au format ISO ou null si vide
        const startDate = start ? new Date(start).toISOString() : null;
        const endDate = end ? new Date(end).toISOString() : null;

        const { error } = await supabase
            .from("projects")
            .update({
                name,
                description,
                color,
                progression,
                tags,
                tags_colors: tagsColors,
                status,
                start: startDate,
                end: endDate,
            })
            .eq("id", project.id);

        if (error) {
            setAlert({
                type: "error",
                title: "Erreur",
                message: "Erreur lors de la sauvegarde des modifications.",
                key: Date.now().toString(),
            });
        } else {
            setAlert({
                type: "success",
                title: "Succès",
                message: "Modifications sauvegardées.",
                key: Date.now().toString(),
            });
        }
    };

    const tabs = [
        "📌 Vue d’ensemble",
        "🧾 Tâches",
        "📊 Indicateurs",
        "🗓️ Planning",
        "📂 Documents",
        "📒 Journal de bord",
        "⚙️ Paramètres",
    ];

    // Ajoute un état pour les membres du projet
    const [members, setMembers] = useState<any[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [previewUser, setPreviewUser] = useState<any | null>(null);
    // Ajoute un état pour l'id utilisateur courant (à adapter selon ton contexte)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email) {
                // Récupère l'id numérique depuis la table users
                const { data: userData } = await supabase
                    .from("users")
                    .select("id")
                    .eq("email", user.email)
                    .single();
                if (userData && userData.id) setCurrentUserId(userData.id);
            }
        };
        fetchCurrentUser();
    }, []);

    // Récupère les membres du projet à l'ouverture de l'overlay ou changement de projet
    const fetchMembers = React.useCallback(async () => {
        if (!project) return;
        setMembersLoading(true);
        const { data: memberLinks } = await supabase
            .from("project_members")
            .select("user_id, role")
            .eq("project_id", project.id);

        if (!memberLinks || memberLinks.length === 0) {
            setMembers([]);
            setMembersLoading(false);
            setCurrentUserRole(null);
            return;
        }

        const userIds = memberLinks.map((m: any) => m.user_id);
        const { data: users } = await supabase
            .from("users")
            .select("id, first_name, special_status, description, last_name, email, picture_url, status, primary_color, secondary_color, banner_url")
            .in("id", userIds);

        const membersList = memberLinks.map((m: any) => ({
            ...users?.find((u: any) => u.id === m.user_id),
            role: m.role,
        }));

        setMembers(membersList);
        setMembersLoading(false);

        // Détermine le rôle du user courant
        if (currentUserId) {
            const myMember = memberLinks.find((m: any) => m.user_id === currentUserId);
            setCurrentUserRole(myMember?.role || null);
        }
    }, [project, currentUserId]);

    useEffect(() => {
        fetchMembers();
    }, [project, fetchMembers]);

    // Handlers pour les actions de la zone de danger
    const handleDeleteProject = async () => {
        if (!project) return;
        setAlert({
            type: "info",
            title: "Suppression...",
            message: "Suppression du projet en cours.",
            key: Date.now().toString(),
        });

        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", project.id);

        if (error) {
            setAlert({
                type: "error",
                title: "Erreur",
                message: "Erreur lors de la suppression du projet.",
                key: Date.now().toString(),
            });
        } else {
            setAlert({
                type: "success",
                title: "Projet supprimé",
                message: "Le projet a bien été supprimé.",
                key: Date.now().toString(),
            });
            setTimeout(() => {
                onClose();
                if (onProjectChanged) onProjectChanged();
            }, 1200);
        }
    };
    const handleArchiveProject = async () => { /* TODO: logique d'archivage */ };
    const handlePauseProject = async () => { /* TODO: logique de pause */ };
    const handleDuplicateProject = async () => { /* TODO: logique de duplication */ };

    // Handler pour retirer un membre
    const handleRemoveMember = async (memberId: number) => {
        if (!project) return;
        // Supprime le membre de la table project_members
        await supabase
            .from("project_members")
            .delete()
            .eq("project_id", project.id)
            .eq("user_id", memberId);
        // Rafraîchit la liste des membres
        setMembers(members.filter(m => m.id !== memberId));
    };

    const AddMemberModal: React.FC<{
        projectId: number;
        currentMembers: number[];
        onClose: () => void;
        onAdded: () => void;
    }> = ({ projectId, currentMembers, onClose, onAdded }) => {
        const [search, setSearch] = useState("");
        const [relations, setRelations] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);

        // Déplace la déclaration de fetchRelations hors du useEffect pour pouvoir l'appeler ici :
        const fetchRelations = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) {
                setLoading(false);
                return;
            }
            const { data: friendsData } = await supabase
                .from("user_friends")
                .select("friend_email")
                .eq("user_email", user.email);
            const friendEmails = (friendsData || []).map((f: any) => f.friend_email);

            if (friendEmails.length === 0) {
                setRelations([]);
                setLoading(false);
                return;
            }
            const { data: usersData } = await supabase
                .from("users")
                .select("*")
                .in("email", friendEmails)
                .not("id", "in", `(${currentMembers.join(",") || 0})`);
            setRelations(usersData || []);
            setLoading(false);
        };

        React.useEffect(() => {
            fetchRelations();
        }, [projectId, currentMembers]);

        const handleAdd = async (userId: number) => {
            await supabase
                .from("project_members")
                .insert([{ project_id: projectId, user_id: userId, role: "Membre" }]);
            onAdded();
            // Rafraîchit la liste des relations pour que le membre ajouté disparaisse de la liste
            fetchRelations();
        };

        const filtered = relations.filter(
            (u: any) =>
                (u.first_name + " " + u.last_name)
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                (u.email || "").toLowerCase().includes(search.toLowerCase())
        );

        return (
            <Modal onClose={onClose}>
                <div className="add-member-modal-root">
                    <Text size={22} bold>Ajouter un membre au projet</Text>
                    <input
                        className="add-member-search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Nom, prénom ou email"
                    />
                    <div className="add-member-list">
                        {loading ? (
                            <Text size={16} color="secondary">Chargement...</Text>
                        ) : filtered.length === 0 ? (
                            <Text size={16} color="secondary">Aucun utilisateur à ajouter</Text>
                        ) : (
                            filtered.map(user => (
                                <div className="add-member-card" key={user.id}>
                                    {/* Bloc avatar identique à Relations */}
                                    {user.picture_url ? (
                                        <div style={{ position: "relative", display: "inline-block" }}>
                                            <img
                                                src={user.picture_url}
                                                alt={user.first_name}
                                                className="relation-avatar"
                                                onClick={() => setPreviewUser && setPreviewUser(user)}
                                            />
                                            <UserStatusDot status={user.status} />
                                        </div>
                                    ) : (
                                        <div
                                            className="relation-avatar"
                                            style={{ position: "relative", display: "inline-block" }}
                                            onClick={() => setPreviewUser && setPreviewUser(user)}
                                        >
                                            <UserStatusDot status={user.status} />
                                        </div>
                                    )}
                                    <div className="add-member-info">
                                        <span className="add-member-name">
                                            {user.first_name} {user.last_name}
                                        </span>
                                        <span className="add-member-role">
                                            {user.special_status || "Utilisateur"}
                                        </span>
                                    </div>
                                    <button
                                        className="add-member-btn"
                                        title="Ajouter ce membre"
                                        onClick={() => handleAdd(user.id)}
                                    >
                                        <FaUserPlus />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>
        );
    };

    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
    const [tasks, setTasks] = useState<any[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    const fetchTasks = React.useCallback(async () => {
        if (!project) return;
        setTasksLoading(true);
        const { data } = await supabase
            .from("tasks")
            .select("*")
            .eq("project_id", project.id);
        setTasks(data || []);
        setTasksLoading(false);
    }, [project]);

    useEffect(() => {
        fetchTasks();
    }, [project, tasksRefreshKey]);

    return (
        <AnimatePresence>
            {project && (
                <motion.div
                    className="project-overlay"
                    initial={{ borderRadius: 32, scale: 0.9, opacity: 0 }}
                    animate={{ borderRadius: 0, scale: 1, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ background: color }}
                >
                    {/* Rightbar membres */}
                    <ProjectMembersBar members={members} onMemberClick={setPreviewUser} />
                    {/* Contenu principal */}
                    <div
                        className="project-overlay-content"
                        style={{ marginRight: 260 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="project-overlay-header">
                            <Text size={40} bold>
                                {name}
                            </Text>
                        </header>

                        {/* Onglets */}
                        <nav className="project-overlay-tabs">
                            {tabs.map((tab, idx) => {
                                // Désactive les onglets 2 (KPI), 3 (Planning/Gantt), 4 (Documents) et 5 (Journal)
                                const isDisabled = idx === 2 || idx === 3 || idx === 4 || idx === 5;
                                return (
                                    <button
                                        key={tab}
                                        className={`project-overlay-tab${selectedTab === idx ? " selected" : ""}`}
                                        onClick={() => !isDisabled && setSelectedTab(idx)}
                                        type="button"
                                        disabled={isDisabled}
                                        style={isDisabled ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </nav>

                        {selectedTab === 0 && (
                            <div className="project-tiles-row">
                                <ProjectOverviewTile
                                    icon={<span role="img" aria-label="Tâches">📝</span>}
                                    title="Nombre de tâches"
                                    value={tasks.length}
                                    description="Tâches totales dans ce projet"
                                />
                                <ProjectOverviewTile
                                    icon={<span role="img" aria-label="Progression">📈</span>}
                                    title="Progression"
                                    value={(project?.progression ?? 0) + " %"}
                                    description="Avancement global"
                                />
                                <ProjectOverviewTile
                                    icon={<span role="img" aria-label="Membres">👥</span>}
                                    title="Membres"
                                    value={members.length}
                                    description="Participants au projet"
                                />
                                <ProjectOverviewTile
                                    icon={<span role="img" aria-label="Statut">🚦</span>}
                                    title="Statut"
                                    value={project?.status || "En cours"}
                                    description="État du projet"
                                />
                                <ProjectOverviewTile
                                    icon={<span role="img" aria-label="Début">📅</span>}
                                    title="Début"
                                    value={project?.start ? new Date(project.start).toLocaleDateString() : "Non défini"}
                                    description="Date de début"
                                />
                                <ProjectOverviewTile
                                    icon={<span role="img" aria-label="Fin">🏁</span>}
                                    title="Fin"
                                    value={project?.end ? new Date(project.end).toLocaleDateString() : "Non défini"}
                                    description="Date de fin"
                                />
                            </div>
                        )}

                        {selectedTab === 1 && (
                            <div style={{ width: "100%" }}>
                                <ProjectTaskList projectId={project.id} refreshKey={tasksRefreshKey} />
                            </div>
                        )}

                        {selectedTab === 1 && currentUserRole === "Propriétaire" && (
                            <div className="project-validate-btn">
                                <Button
                                    text="Créer une tâche"
                                    variant="success"
                                    onClick={() => setShowCreateTaskModal(true)}
                                    prefixIcon={<FaCheck />}
                                    size="small"
                                />
                            </div>
                        )}

                        {/* Contenu de l’onglet */}
                        <div className="project-overlay-details">
                            {selectedTab === 6 ? (
                                <form
                                    className="project-settings-form"
                                    onSubmit={e => { e.preventDefault(); handleSave(); }}
                                >
                                    <div className="form-row inline">
                                        <Input
                                            header="Nom du projet"
                                            value={name}
                                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setName(e.target.value)}
                                            disabled={currentUserRole !== "Propriétaire"}
                                        />
                                        <Input
                                            header="Couleur projet"
                                            type="color"
                                            value={color}
                                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setColor(e.target.value)}
                                            disabled={currentUserRole !== "Propriétaire"}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <Input
                                            header="Description"
                                            value={description}
                                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setDescription(e.target.value)}
                                            type="textarea"
                                            disabled={currentUserRole !== "Propriétaire"}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <TagInput
                                            header="Tags (séparés par des virgules)"
                                            tags={tags}
                                            setTags={setTags}
                                            tagsColors={tagsColors}
                                            setTagsColors={setTagsColors}
                                            placeholder="ex: urgent, client, interne"
                                            disabled={currentUserRole !== "Propriétaire"}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <Input
                                            header="Date de début"
                                            type="date"
                                            value={start}
                                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setStart(e.target.value)}
                                            disabled={currentUserRole !== "Propriétaire"}
                                        />
                                        <Input
                                            header="Date de fin"
                                            type="date"
                                            value={end}
                                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setEnd(e.target.value)}
                                            disabled={currentUserRole !== "Propriétaire"}
                                        />
                                    </div>
                                    {/* --- Gestion des membres --- */}
                                    <div className="form-row">
                                        <div style={{ width: "100%" }}>
                                            <div className="project-members-header">
                                                <Text size={18} bold>Gestion des membres</Text>
                                                {currentUserRole === "Propriétaire" && (
                                                    <button
                                                        className="project-add-member-btn"
                                                        type="button"
                                                        onClick={() => setShowAddMemberModal(true)}
                                                    >
                                                        <FaUserPlus className="project-add-member-icon" />
                                                        Ajouter un membre
                                                    </button>
                                                )}
                                            </div>
                                            {membersLoading ? (
                                                <Text size={16} color="secondary">Chargement des membres...</Text>
                                            ) : members.length === 0 ? (
                                                <Text size={16} color="secondary">Aucun membre dans ce projet.</Text>
                                            ) : (
                                                <div className="project-members-list">
                                                    {members.map(member => (
                                                        <div
                                                            className={`project-member-card${member.role === "Propriétaire" ? " project-member-owner" : ""}`}
                                                            key={member.id}
                                                        >
                                                            <div
                                                                className="project-member-avatar"
                                                                onClick={() => setPreviewUser(member)}
                                                            >
                                                                <img
                                                                    src={member.picture_url || "/assets/avatar1.png"}
                                                                    alt={member.first_name || member.last_name}
                                                                />
                                                                <UserStatusDot status={member.status} />
                                                            </div>
                                                            <div className="project-member-info">
                                                                <span className="project-member-name">
                                                                    {member.first_name || ""} {member.last_name || ""}
                                                                </span>
                                                                <span className="project-member-role project-member-role-left">
                                                                    {member.role}
                                                                </span>
                                                            </div>
                                                            {member.id !== currentUserId && currentUserRole === "Propriétaire" && (
                                                                <button
                                                                    className="project-member-remove-btn"
                                                                    title="Retirer ce membre"
                                                                    onClick={() => handleRemoveMember(member.id)}
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* --- Fin gestion des membres --- */}
                                    {/* --- Zone de danger --- */}
                                    {currentUserRole === "Propriétaire" && (
                                        <div className="form-row">
                                            <div className="danger-zone">
                                                <Text size={18} bold color="danger">Zone de danger</Text>
                                                <div className="danger-zone-actions">
                                                    <div className="danger-zone-row">
                                                        <Button
                                                            text="Supprimer le projet"
                                                            variant="failure"
                                                            onClick={handleDeleteProject}
                                                        />
                                                        <Text size={15} color="danger">
                                                            Supprime définitivement ce projet et toutes ses données.
                                                        </Text>
                                                    </div>
                                                    <div className="danger-zone-row">
                                                        <Button
                                                            text="Archiver le projet"
                                                            variant="failure"
                                                            onClick={handleArchiveProject}
                                                            disabled
                                                        />
                                                        <Text size={15} color="danger">
                                                            Rend le projet inactif, mais récupérable plus tard.
                                                        </Text>
                                                    </div>
                                                    <div className="danger-zone-row">
                                                        <Button
                                                            text="Mettre en pause"
                                                            variant="warning"
                                                            onClick={handlePauseProject}
                                                            disabled
                                                        />
                                                        <Text size={15} color="warning">
                                                            Suspend temporairement l’activité du projet.
                                                        </Text>
                                                    </div>
                                                    <div className="danger-zone-row">
                                                        <Button
                                                            text="Dupliquer"
                                                            variant="primary"
                                                            onClick={handleDuplicateProject}
                                                            disabled
                                                        />
                                                        <Text size={15} color="primary">
                                                            Crée une copie de ce projet.
                                                        </Text>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* --- Fin zone de danger --- */}
                                </form>
                            ) : (
                                <>
                                </>
                            )}
                        </div>

                        {/* Bouton de validation en bas à droite sur l’onglet paramètres */}
                        {selectedTab === 6 && (
                            <div className="project-validate-btn">
                                <Button
                                    text="Valider les changements"
                                    variant="success"
                                    onClick={handleSave}
                                    prefixIcon={<FaCheck />}
                                    size="small"
                                    disabled={currentUserRole !== "Propriétaire"}
                                />
                            </div>
                        )}
                        {/* Affichage de l'alerte flottante */}
                        {alert && (
                            <Alert
                                key={alert.key}
                                type={alert.type}
                                title={alert.title}
                                onClose={() => setAlert(null)}
                            >
                                {alert.message}
                            </Alert>
                        )}
                    </div>
                    {/* Bouton retour en bas à gauche */}
                    <div className="project-back-btn">
                        <Button
                            text="Retour sur la liste des projets"
                            variant="secondary"
                            onClick={onClose}
                            prefixIcon={<span style={{ fontSize: 18, marginRight: 6 }}>←</span>}
                            size="small"
                        />
                    </div>

                    {/* Modal d'ajout de membre */}
                    {showAddMemberModal && (
                        <AddMemberModal
                            projectId={project.id}
                            currentMembers={members.map(m => m.id)}
                            onClose={() => setShowAddMemberModal(false)}
                            onAdded={() => {
                                setShowAddMemberModal(false);
                                fetchMembers();
                                if (onProjectChanged) onProjectChanged();
                            }}
                        />
                    )}

                    {showCreateTaskModal && project && (
                        <CreateTaskModal
                            projectId={project.id}
                            assignerId={currentUserId}
                            onClose={() => setShowCreateTaskModal(false)}
                            onTaskCreated={() => {
                                setShowCreateTaskModal(false);
                                setTasksRefreshKey(k => k + 1); // <-- Ajoute ceci pour rafraîchir la liste
                            }}
                        />
                    )}
                    {previewUser && (
                        <ProfilePreviewModal user={previewUser} onClose={() => setPreviewUser(null)} />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProjectOverlay;
