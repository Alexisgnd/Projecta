import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Text from "./Text";
import Button from "./Button";
import Input from "./Input";
import { FaCheck } from "react-icons/fa";
import "./ProjectOverlay.css";
import Alert from "./Alert";
import supabase from "../supabaseClient";
import TagInput from "./TagInput";
import ProfilePreviewModal from "./ProfilePreviewModal";
import { UserStatusDot } from "./UserStatus";

interface Project {
    id: number;
    name: string;
    color: string;
    progression: number;
    num_tasks: number;
    description?: string;
    num_members?: number;
    tags?: string[];
    tags_colors?: { [key: string]: string };
    status?: string;
    start?: string;
    end?: string;
}

interface ProjectOverlayProps {
    project: Project | null;
    onClose: () => void;
}

const ProjectOverlay: React.FC<ProjectOverlayProps> = ({ project, onClose }) => {
    const [selectedTab, setSelectedTab] = React.useState(0);

    // Ajout des états pour tous les champs
    const [name, setName] = React.useState(project?.name || "");
    const [description, setDescription] = React.useState(project?.description || "");
    const [progression, setProgression] = React.useState(project?.progression || 0);
    const [color, setColor] = React.useState(project?.color || "#a259ff");
    const [numTasks, setNumTasks] = React.useState(project?.num_tasks || 0);
    const [numMembers, setNumMembers] = React.useState(project?.num_members || 1);
    const [tags, setTags] = React.useState<string[]>(project?.tags || []);
    const [tagsColors, setTagsColors] = React.useState<{ [key: string]: string }>(project?.tags_colors || {});
    const [status, setStatus] = React.useState(project?.status || "");
    const [start, setStart] = React.useState(project?.start ? project.start.substring(0, 10) : "");
    const [end, setEnd] = React.useState(project?.end ? project.end.substring(0, 10) : "");

    // Remet à jour les états quand le projet change
    useEffect(() => {
        setSelectedTab(0);
        setName(project?.name || "");
        setDescription(project?.description || "");
        setProgression(project?.progression || 0);
        setColor(project?.color || "#a259ff");
        setNumTasks(project?.num_tasks || 0);
        setNumMembers(project?.num_members || 1);
        setTags(project?.tags || []);
        setTagsColors(project?.tags_colors || {});
        setStatus(project?.status || "");
        setStart(project?.start ? project.start.substring(0, 10) : "");
        setEnd(project?.end ? project.end.substring(0, 10) : "");
    }, [project]);

    // Ajoute un état pour l'alerte
    const [alert, setAlert] = React.useState<{
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
                num_tasks: numTasks,
                num_members: numMembers,
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
        "🧾 Tâches / Kanban",
        "📊 Indicateurs & KPI",
        "🗓️ Planning / Gantt",
        "📂 Documents du projet",
        "📒 Journal de bord",
        "⚙️ Paramètres du projet",
    ];

    // Ajoute un état pour les membres du projet
    const [members, setMembers] = React.useState<any[]>([]);
    const [membersLoading, setMembersLoading] = React.useState(false);
    const [previewUser, setPreviewUser] = React.useState<any | null>(null);

    // Récupère les membres du projet à l'ouverture de l'overlay ou changement de projet
    useEffect(() => {
        const fetchMembers = async () => {
            if (!project) return;
            setMembersLoading(true);
            // Récupère les membres depuis project_members
            const { data: memberLinks } = await supabase
                .from("project_members")
                .select("user_id, role")
                .eq("project_id", project.id);

            if (!memberLinks || memberLinks.length === 0) {
                setMembers([]);
                setMembersLoading(false);
                return;
            }

            // Récupère les infos utilisateurs
            const userIds = memberLinks.map((m: any) => m.user_id);
            const { data: users } = await supabase
                .from("users")
                .select("id, first_name, last_name, picture_url, status")
                .in("id", userIds);

            // Fusionne infos membres et users
            const membersList = memberLinks.map((m: any) => ({
                ...users?.find((u: any) => u.id === m.user_id),
                role: m.role,
            }));

            setMembers(membersList);
            setMembersLoading(false);
        };
        fetchMembers();
    }, [project]);

    // Handlers pour les actions de la zone de danger
    const handleDeleteProject = async () => { /* TODO: logique de suppression */ };
    const handleArchiveProject = async () => { /* TODO: logique d'archivage */ };
    const handlePauseProject = async () => { /* TODO: logique de pause */ };
    const handleDuplicateProject = async () => { /* TODO: logique de duplication */ };

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
                    onClick={onClose}
                >
                    <div
                        className="project-overlay-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="project-overlay-header">
                            <Text size={40} bold>
                                {name}
                            </Text>
                        </header>

                        {/* Onglets */}
                        <nav className="project-overlay-tabs">
                            {tabs.map((tab, idx) => {
                                // Désactive les onglets 2 (KPI) et 5 (Journal)
                                const isDisabled = idx === 2 || idx === 5;
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
                                        />
                                        <Input
                                            header="Couleur projet"
                                            type="color"
                                            value={color}
                                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setColor(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <Input
                                            header="Description"
                                            value={description}
                                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setDescription(e.target.value)}
                                            type="textarea"
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
                                        />
                                    </div>
                                    <div className="form-row">
                                        <Input
                                            header="Date de début"
                                            type="date"
                                            value={start}
                                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setStart(e.target.value)}
                                        />
                                        <Input
                                            header="Date de fin"
                                            type="date"
                                            value={end}
                                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setEnd(e.target.value)}
                                        />
                                    </div>
                                    {/* --- Gestion des membres --- */}
                                    <div className="form-row">
                                        <div style={{ width: "100%" }}>
                                            <Text size={18} bold>Gestion des membres</Text>
                                            {membersLoading ? (
                                                <Text size={16} color="secondary">Chargement des membres...</Text>
                                            ) : members.length === 0 ? (
                                                <Text size={16} color="secondary">Aucun membre dans ce projet.</Text>
                                            ) : (
                                                <div className="project-members-list">
                                                    {members.map(member => (
                                                        <div
                                                            className={`project-member-card${member.role === "Owner" ? " project-member-owner" : ""}`}
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
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {previewUser && (
                                            <ProfilePreviewModal user={previewUser} onClose={() => setPreviewUser(null)} />
                                        )}
                                    </div>
                                    {/* --- Fin gestion des membres --- */}
                                    {/* --- Zone de danger --- */}
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
                                                    />
                                                    <Text size={15} color="primary">
                                                        Crée une copie de ce projet.
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* --- Fin zone de danger --- */}
                                </form>
                            ) : (
                                <>
                                    <Text size={20}>
                                        {project.num_tasks} tâche
                                        {project.num_tasks > 1 ? "s" : ""}
                                    </Text>
                                    <Text size={20}>Progression : {project.progression}%</Text>
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
                                    size="large"
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
                            size="large"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProjectOverlay;
