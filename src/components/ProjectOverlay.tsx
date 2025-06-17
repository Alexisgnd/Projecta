import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { FaUserPlus, FaTimes } from "react-icons/fa";
import Text from "./Text";
import { motion, AnimatePresence } from "framer-motion";
import "./ProjectOverlay.css";
import Input from "./Input";
import Alert from "./Alert";
import Button from "./Button";
import TagInput from "./TagInput";
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
    tags?: string[];
    tags_colors?: { [tag: string]: string };
    status?: string;
    start?: string | null;
    end?: string | null;
}

interface ProjectOverlayProps {
    project: Project | null;
    onClose: () => void;
}

const ProjectOverlay: React.FC<ProjectOverlayProps> = ({ project, onClose }) => {
    const [selectedTab, setSelectedTab] = useState(0);

    const tabs = [
        "📌 Vue d’ensemble",
        "🧾 Tâches / Kanban",
        "📊 Indicateurs & KPI",
        "🗓️ Planning / Gantt",
        "📂 Documents du projet",
        "📒 Journal de bord",
        "⚙️ Paramètres du projet"
    ];

    useEffect(() => {
        setSelectedTab(0);
    }, [project]);

    // Nouveau composant pour l’onglet paramètres
    const ProjectSettingsPanel = ({
        name,
        setName,
        description,
        setDescription,
        tagsArr,
        setTagsArr,
        tagsColors,
        setTagsColors,
        loading,
        alert,
        setAlert,
        // Ajoute ici les autres props nécessaires
    }: any) => {
        // États pour les membres
        const [members, setMembers] = useState<any[]>([]);
        const [relations, setRelations] = useState<any[]>([]);
        const [loadingMembers, setLoadingMembers] = useState(false);
        const [showAddModal, setShowAddModal] = useState(false);
        const [search, setSearch] = useState("");
        const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
        const [currentUserId, setCurrentUserId] = useState<number | null>(null);

        // États pour les dates et statut
        const [startDate, setStartDate] = useState(project?.start ? project.start.substring(0, 10) : "");
        const [endDate, setEndDate] = useState(project?.end ? project.end.substring(0, 10) : "");
        const [status, setStatus] = useState(project?.status || "en cours");

        // Récupère l'id numérique de l'utilisateur courant
        useEffect(() => {
            supabase.auth.getUser().then(async ({ data }) => {
                const email = data?.user?.email;
                if (!email) return;
                setCurrentUserEmail(email);
                const { data: userData } = await supabase
                    .from("users")
                    .select("id")
                    .eq("email", email)
                    .single();
                if (userData?.id) {
                    setCurrentUserId(Number(userData.id));
                }
            });
        }, []);

        // Met à jour les états locaux si le projet change
        useEffect(() => {
            setName(project?.name || "");
            setDescription(project?.description || "");
            setTagsArr(project?.tags || []);
            setTagsColors(project?.tags_colors || {});
            setStartDate(project?.start ? project.start.substring(0, 10) : "");
            setEndDate(project?.end ? project.end.substring(0, 10) : "");
            setStatus(project?.status || "en cours");
        }, [project]);

        // Récupère les membres du projet via project_members
        const fetchMembers = async () => {
            if (!project?.id) return;
            setLoadingMembers(true);
            // 1. Récupère les liens membres pour ce projet
            const { data: projectMembers } = await supabase
                .from("project_members")
                .select("id, user_id, role")
                .eq("project_id", project.id);

            const userIds = (projectMembers || []).map((m: any) => m.user_id);
            let usersMap: Record<number, any> = {};
            if (userIds.length > 0) {
                // 2. Récupère les infos utilisateurs
                const { data: usersData } = await supabase
                    .from("users")
                    .select("id, first_name, last_name, picture_url, email")
                    .in("id", userIds);
                usersMap = Object.fromEntries((usersData || []).map(u => [u.id, u]));
            }

            // 3. Fusionne
            setMembers(
                (projectMembers || []).map((m: any) => ({
                    ...m,
                    user: usersMap[m.user_id] || {},
                }))
            );
            setLoadingMembers(false);
        };

        // Récupère les relations ajoutées (amis) qui ne sont PAS membres du projet
        const fetchRelations = async () => {
            if (!currentUserEmail) return;
            // 2. Récupère les emails des amis
            const { data: friendsData } = await supabase
                .from("user_friends")
                .select("friend_email")
                .eq("user_email", currentUserEmail);

            const friendEmails = friendsData?.map(f => f.friend_email) || [];
            if (friendEmails.length === 0) {
                setRelations([]);
                return;
            }

            // 3. Récupère les infos utilisateurs de ces amis
            const { data: usersData } = await supabase
                .from("users")
                .select("id, first_name, last_name, email, picture_url")
                .in("email", friendEmails);

            // 4. Exclure ceux déjà membres du projet
            const memberIds = members.map(m => m.user?.id);
            const notYetMembers = (usersData || []).filter(u => !memberIds.includes(u.id));
            setRelations(notYetMembers);
        };

        // Rafraîchit les membres et relations à chaque ouverture de la modal ou changement de projet
        useEffect(() => {
            fetchMembers();
        }, [project?.id]);

        useEffect(() => {
            if (showAddModal && members.length > 0) {
                fetchRelations();
            }
            // eslint-disable-next-line
        }, [showAddModal, members, currentUserEmail]);

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

        // Handler: Archiver le projet
        const handleArchiveProject = async () => {
            setAlert(null);
            setLoading(true);
            const { error } = await supabase
                .from("projects")
                .update({ status: "archivé" })
                .eq("id", project?.id);
            setLoading(false);
            if (error) {
                setAlert({
                    type: "error",
                    title: "Erreur",
                    message: "L'archivage du projet a échoué.",
                    key: Date.now().toString(),
                });
            } else {
                setAlert({
                    type: "success",
                    title: "Succès",
                    message: "Projet archivé avec succès.",
                    key: Date.now().toString(),
                });
            }
        };

        // Handler: Dupliquer le projet
        const handleDuplicateProject = async () => {
            setAlert(null);
            setLoading(true);
            // Récupère le projet courant
            const { data: currentProject, error: fetchError } = await supabase
                .from("projects")
                .select("*")
                .eq("id", project?.id)
                .single();
            if (fetchError || !currentProject) {
                setLoading(false);
                setAlert({
                    type: "error",
                    title: "Erreur",
                    message: "Impossible de dupliquer le projet.",
                    key: Date.now().toString(),
                });
                return;
            }
            // Crée un nouveau projet avec les mêmes infos (sauf id, dates, etc.)
            const { error: insertError } = await supabase
                .from("projects")
                .insert({
                    ...currentProject,
                    id: undefined,
                    name: currentProject.name + " (copie)",
                    created_at: new Date().toISOString(),
                    status: "en cours",
                });
            setLoading(false);
            if (insertError) {
                setAlert({
                    type: "error",
                    title: "Erreur",
                    message: "La duplication du projet a échoué.",
                    key: Date.now().toString(),
                });
            } else {
                setAlert({
                    type: "success",
                    title: "Succès",
                    message: "Projet dupliqué avec succès.",
                    key: Date.now().toString(),
                });
            }
        };

        // Handler: Supprimer le projet
        const handleDeleteProject = async () => {
            setAlert(null);
            setLoading(true);
            const { error } = await supabase
                .from("projects")
                .delete()
                .eq("id", project?.id);
            setLoading(false);
            if (error) {
                setAlert({
                    type: "error",
                    title: "Erreur",
                    message: "La suppression du projet a échoué.",
                    key: Date.now().toString(),
                });
            } else {
                setAlert({
                    type: "success",
                    title: "Succès",
                    message: "Projet supprimé avec succès.",
                    key: Date.now().toString(),
                });
                // Optionnel: fermer l'overlay après suppression
                if (typeof onClose === "function") onClose();
            }
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
                        header="Date de début"
                        type="date"
                        value={startDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                        disabled={loading}
                    />
                    <Input
                        header="Date de fin"
                        type="date"
                        value={endDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
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
                    <div>
                        <div style={{ fontWeight: "bold", marginBottom: 8, color: "#000" }}>État du projet</div>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            disabled={loading}
                            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", width: "100%" }}
                        >
                            <option value="en cours">En cours</option>
                            <option value="en pause">En pause</option>
                            <option value="terminé">Terminé</option>
                            <option value="annulé">Annulé</option>
                        </select>
                    </div>
                </div>
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
                                {member.user?.picture_url ? (
                                    <img
                                        src={member.user.picture_url}
                                        alt={member.user.first_name}
                                        className="relation-avatar"
                                    />
                                ) : (
                                    <div className="relation-avatar" />
                                )}
                                <div className="relation-info">
                                    <span className="relation-name">
                                        {member.user?.first_name} {member.user?.last_name}
                                    </span>
                                    <span className="relation-status">
                                        {member.role}
                                    </span>
                                </div>
                                {member.user?.id !== currentUserId && (
                                    <button
                                        className="remove-member-btn"
                                        title="Retirer ce membre"
                                        onClick={() => handleRemoveMember(member.id, member.user?.id)}
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        )))
                    }
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
                {/* 4. Modèles & préférences */}
                {/* <div className="project-settings-section-title">
                    <Text size={20} bold>🧾 Modèles & préférences</Text>
                </div> */}
                {/* À compléter avec workflow, unités, KPIs */}

                {/* 5. Nettoyage & Archivage */}
                <div className="project-settings-section-title">
                    <Text size={20} bold>📂 Nettoyage & Archivage</Text>
                </div>
                <div className="project-cleanup-actions">
                    <button
                        className="project-cleanup-btn archive"
                        onClick={handleArchiveProject}
                        disabled={loading}
                    >
                        Archiver le projet
                    </button>
                    <button
                        className="project-cleanup-btn duplicate"
                        onClick={handleDuplicateProject}
                        disabled={loading}
                    >
                        Dupliquer le projet
                    </button>
                    <button
                        className="project-cleanup-btn delete"
                        onClick={handleDeleteProject}
                        disabled={loading}
                    >
                        Supprimer le projet
                    </button>
                </div>

                {/* 6. Confidentialité / Accès */}
                <div className="project-settings-section-title">
                    <Text size={20} bold>🔒 Confidentialité / Accès</Text>
                </div>
                {/* À compléter avec visibilité, lien partageable */}

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
        );
    };

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{
        type: "error" | "success" | "info" | "warning";
        title: string;
        message: React.ReactNode;
        key?: string;
    } | null>(null);

    const [name, setName] = useState(project?.name || "");
    const [description, setDescription] = useState(project?.description || "");
    const [tagsArr, setTagsArr] = useState<string[]>(project?.tags || []);
    const [tagsColors, setTagsColors] = useState<{ [tag: string]: string }>(project?.tags_colors || {});
    const [startDate, setStartDate] = useState(project?.start ? project.start.substring(0, 10) : "");
    const [endDate, setEndDate] = useState(project?.end ? project.end.substring(0, 10) : "");
    const [status, setStatus] = useState(project?.status || "en cours");
    // ...ajoute les autres états nécessaires...

    const handleSave = async () => {
        setLoading(true);
        setAlert(null);
        const { error } = await supabase
            .from("projects")
            .update({
                name,
                description,
                tags: tagsArr,
                tags_colors: tagsColors,
                start: startDate ? new Date(startDate).toISOString() : null,
                end: endDate ? new Date(endDate).toISOString() : null,
                status,
                // ...autres champs...
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
                                <ProjectSettingsPanel
                                    name={name}
                                    setName={setName}
                                    description={description}
                                    setDescription={setDescription}
                                    tagsArr={tagsArr}
                                    setTagsArr={setTagsArr}
                                    tagsColors={tagsColors}
                                    setTagsColors={setTagsColors}
                                    loading={loading}
                                    alert={alert}
                                    setAlert={setAlert}
                                    setStartDate={startDate}
                                    setEndDate={endDate}
                                    setStatus={status}
                                // ...autres props nécessaires...
                                />
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
                        {/* Bouton en bas à droite */}
                        {selectedTab === 6 && (
                            <div className="project-overlay-actions">
                                <Button
                                    text={loading ? "Enregistrement..." : "Valider les changements"}
                                    variant="primary"
                                    style={{ minWidth: 180, padding: 25 }}
                                    onClick={handleSave}
                                    disabled={loading}
                                />
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProjectOverlay;