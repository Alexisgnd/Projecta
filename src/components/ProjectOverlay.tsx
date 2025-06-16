import React from "react";
import Text from "./Text";
import { motion, AnimatePresence } from "framer-motion";
import "./ProjectOverlay.css";
import Input from "./Input";
import Alert from "./Alert";
import supabase from "../supabaseClient";
import Button from "./Button";
import TagInput from "./TagInput";

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

        // Met à jour les états locaux si le projet change
        React.useEffect(() => {
            setName(project?.name || "");
            setDescription(project?.description || "");
            setGoal(project?.goal || "");
            setTagsArr(project?.tags || []);
            setTagsColors(project?.tags_colors || {});
        }, [project]);

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
                {/* À compléter avec la logique d’ajout/retrait et rôles */}

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