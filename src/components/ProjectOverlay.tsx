import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import Text from "./Text";
import { motion, AnimatePresence } from "framer-motion";
import "./ProjectOverlay.css";
import Input from "./Input";
import Alert from "./Alert";
import Button from "./Button";
import TagInput from "./TagInput";
import { FaUserPlus, FaTimes } from "react-icons/fa";
import Modal from "./Modal";

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
    description?: string;
    goal?: string;
    tags?: string[];
    tags_colors?: { [tag: string]: string };
}

interface ProjectOverlayProps {
    project: Project | null;
    onClose: () => void;
}

const ProjectOverlay: React.FC<ProjectOverlayProps> = ({ project, onClose }) => {
    const [selectedTab, setSelectedTab] = React.useState(0);

    const tabs = [
        "📌 Vue d’ensemble",
        "🧾 Tâches / Kanban",
        "📊 Indicateurs & KPI",
        "🗓️ Planning / Gantt",
        "📂 Documents du projet",
        "📒 Journal de bord",
        "⚙️ Paramètres du projet"
    ];

    React.useEffect(() => {
        setSelectedTab(0);
    }, [project]);

    // Nouveau composant pour l’onglet paramètres
    function ProjectSettingsPanel() {
        // États pour les infos générales
        const [name, setName] = React.useState(project?.name || "");
        const [description, setDescription] = React.useState(project?.description || "");
        const [goal, setGoal] = React.useState(project?.goal || "");
        const [tagsArr, setTagsArr] = React.useState<string[]>(project?.tags || []);
        const [tagsColors, setTagsColors] = React.useState<{ [tag: string]: string }>(project?.tags_colors || {});
        const [loading, setLoading] = React.useState(false);
        const [alert, setAlert] = React.useState<{
            type: "error" | "success" | "info" | "warning";
            title: string;
            message: React.ReactNode;
            key?: string;
        } | null>(null);

        // États pour les membres
        const [members, setMembers] = useState<any[]>([]);
        const [loadingMembers, setLoadingMembers] = useState(false);
        const [showAddModal, setShowAddModal] = useState(false);
        const [relations, setRelations] = useState<any[]>([]);
        const [search, setSearch] = useState("");
        const [currentUserId, setCurrentUserId] = useState<number | null>(null);

        // Met à jour les états locaux si le projet change
        React.useEffect(() => {
            setName(project?.name || "");
            setDescription(project?.description || "");
            setGoal(project?.goal || "");
            setTagsArr(project?.tags || []);
            setTagsColors(project?.tags_colors || {});
        }, [project]);

        // Fonction pour récupérer les membres du projet avec leurs infos utilisateur
        const fetchMembers = async () => {
            if (!project?.id) return;
            setLoadingMembers(true);
            const { data: projectMembers } = await supabase
                .from("project_members")
                .select("id, user_id, role, users: user_id (id, first_name, last_name, picture_url, email)")
                .eq("project_id", project.id);

            setMembers(projectMembers || []);
            setLoadingMembers(false);
        };

        useEffect(() => {
            fetchMembers();
        }, [project?.id]);

        // Récupère l'utilisateur courant
        useEffect(() => {
            supabase.auth.getUser().then(async ({ data }) => {
                if (!data?.user?.email) return;
                // Récupère l'id utilisateur
                const { data: userData } = await supabase
                    .from("users")
                    .select("id")
                    .eq("email", data.user.email)
                    .single();
                setCurrentUserId(userData?.id || null);

                // Récupère les relations ajoutées (user_friends)
                const { data: friendsData } = await supabase
                    .from("user_friends")
                    .select("friend_email")
                    .eq("user_email", data.user.email);

                const friendEmails = friendsData?.map(f => f.friend_email) || [];
                if (friendEmails.length > 0) {
                    const { data: usersData } = await supabase
                        .from("users")
                        .select("id, first_name, last_name, email, picture_url")
                        .in("email", friendEmails);
                    setRelations(usersData || []);
                }
            });
        }, []);

        const handleSave = async () => {
            setLoading(true);
            setAlert(null);
            const { error } = await supabase
                .from("projects")
                .update({
                    name,
                    description,
                    goal,
                    tags: tagsArr,
                    tags_colors: tagsColors,
                })
                .eq("id", project?.id);
            setLoading(false);
            if (error) {
                setAlert({
                    type: "error",
                    title: "Erreur",
                    message: "La mise à jour a échoué.",
                    key: Date.now().toString(),
                });
            } else {
                setAlert({
                    type: "success",
                    title: "Succès",
                    message: "Projet mis à jour avec succès.",
                    key: Date.now().toString(),
                });
            }
        };

        // Ajout d'un membre au projet
        const handleAddMember = async (userId: number) => {
            if (!project) return;
            await supabase.from("project_members").insert({
                project_id: project.id,
                user_id: userId,
                role: "Membre"
            });
            setShowAddModal(false);
            // Refresh membres
            fetchMembers();
        };

        // Suppression d'un membre (sauf soi-même)
        const handleRemoveMember = async (memberId: number, userId: number) => {
            if (userId === currentUserId) return;
            await supabase.from("project_members").delete().eq("id", memberId);
            fetchMembers();
        };

        return (
            <div className="project-settings-panel">
                {/* 1. Informations générales */}
                <div className="project-settings-section-title">
                    <Text size={20} bold>📝 Informations générales</Text>
                </div>
                <div className="project-settings-general-grid">
                    <Input
                        header="Nom du projet"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        disabled={loading}
                    />
                    <Input
                        header="Description courte"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                        disabled={loading}
                    />
                    <Input
                        header="Objectif du projet"
                        value={goal}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoal(e.target.value)}
                        disabled={loading}
                    />
                    <div>
                        <div style={{ fontWeight: "bold", marginBottom: 8, color: "#000" }}>Tags / catégories</div>
                        <TagInput
                            tags={tagsArr}
                            setTags={setTagsArr}
                            tagsColors={tagsColors}
                            setTagsColors={setTagsColors}
                            disabled={loading}
                            placeholder="ex: interne, client, urgent"
                        />
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button
                        text={loading ? "Enregistrement..." : "Valider les changements"}
                        variant="primary"
                        style={{ minWidth: 180, padding: 25 }}
                        onClick={handleSave}
                        disabled={loading}
                    />
                </div>
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
                {/* 2. Gestion des membres */}
                <div className="project-settings-section-title">
                    <Text size={20} bold>👥 Gestion des membres</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                    <button
                        className="add-member-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        <FaUserPlus style={{ marginRight: 8 }} />
                        Ajouter des membres
                    </button>
                </div>
                <div className="project-members-list">
                    {loadingMembers ? (
                        <Text size={16} color="secondary">Chargement...</Text>
                    ) : members.length === 0 ? (
                        <Text size={16} color="secondary">Aucun membre dans ce projet.</Text>
                    ) : (
                        members.map((member) => (
                            <div className="relation-card" key={member.id}>
                                {member.users?.picture_url ? (
                                    <img
                                        src={member.users.picture_url}
                                        alt={member.users.first_name}
                                        className="relation-avatar"
                                    />
                                ) : (
                                    <div className="relation-avatar" />
                                )}
                                <div className="relation-info">
                                    <span className="relation-name">
                                        {member.users?.first_name} {member.users?.last_name}
                                    </span>
                                    <span className="relation-status">
                                        {member.role}
                                    </span>
                                </div>
                                {member.users?.id !== currentUserId && (
                                    <button
                                        className="remove-member-btn"
                                        title="Retirer ce membre"
                                        onClick={() => handleRemoveMember(member.id, member.users?.id)}
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
                {/* Modal d'ajout de membres */}
                {showAddModal && (
                    <Modal onClose={() => setShowAddModal(false)}>
                        <div className="add-member-modal">
                            <Text size={20} bold>Ajouter des membres</Text>
                            <input
                                className="add-member-search"
                                type="text"
                                placeholder="Rechercher une relation..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <div className="add-member-list">
                                {relations
                                    .filter(r =>
                                        (r.first_name + " " + r.last_name)
                                            .toLowerCase()
                                            .includes(search.toLowerCase())
                                    )
                                    .filter(r =>
                                        !members.some(m => m.users?.id === r.id)
                                    )
                                    .map(r => (
                                        <div className="relation-card" key={r.id}>
                                            {r.picture_url ? (
                                                <img
                                                    src={r.picture_url}
                                                    alt={r.first_name}
                                                    className="relation-avatar"
                                                />
                                            ) : (
                                                <div className="relation-avatar" />
                                            )}
                                            <div className="relation-info">
                                                <span className="relation-name">
                                                    {r.first_name} {r.last_name}
                                                </span>
                                                <span className="relation-status">
                                                    Relation ajoutée
                                                </span>
                                            </div>
                                            <button
                                                className="add-member-round-btn"
                                                title="Ajouter ce membre"
                                                onClick={() => handleAddMember(r.id)}
                                            >
                                                <FaUserPlus />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </Modal>
                )}
                {/* 3. Structure du projet */}
                <div className="project-settings-section-title">
                    <Text size={20} bold>🧩 Structure du projet</Text>
                </div>
                {/* À compléter avec les dates, état, périmètre */}

                {/* 4. Modèles & préférences */}
                <div className="project-settings-section-title">
                    <Text size={20} bold>🧾 Modèles & préférences</Text>
                </div>
                {/* À compléter avec workflow, unités, KPIs */}

                {/* 5. Nettoyage & Archivage */}
                <div className="project-settings-section-title">
                    <Text size={20} bold>📂 Nettoyage & Archivage</Text>
                </div>
                {/* À compléter avec boutons archiver, dupliquer, supprimer */}

                {/* 6. Confidentialité / Accès */}
                <div className="project-settings-section-title">
                    <Text size={20} bold>🔒 Confidentialité / Accès</Text>
                </div>
                {/* À compléter avec visibilité, lien partageable */}
            </div>
        );
    }

    return (
        <AnimatePresence>
            {project && (
                <motion.div
                    className="project-overlay"
                    initial={{ borderRadius: 32, scale: 0.9, opacity: 0 }}
                    animate={{
                        borderRadius: 0,
                        scale: 1,
                        opacity: 1,
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                        background: project.color || "#a259ff",
                    }}
                    onClick={onClose}
                >
                    <div
                        className="project-overlay-content"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="project-overlay-header">
                            <Text size={40} bold>
                                {project.name}
                            </Text>
                        </div>
                        <div className="project-overlay-tabs">
                            {tabs.map((tab, idx) => (
                                <button
                                    key={tab}
                                    className={`project-overlay-tab${selectedTab === idx ? " selected" : ""}`}
                                    onClick={() => setSelectedTab(idx)}
                                    type="button"
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="project-overlay-details">
                            {selectedTab === 6 ? (
                                <ProjectSettingsPanel />
                            ) : (
                                <>
                                    <Text size={20}>
                                        {project.num_tasks} tâche{project.num_tasks > 1 ? "s" : ""}
                                    </Text>
                                    <Text size={20}>
                                        Progression : {project.progression}%
                                    </Text>
                                </>
                            )}
                        </div>
                        <button
                            className="project-overlay-close"
                            onClick={onClose}
                        >
                            Fermer
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProjectOverlay;