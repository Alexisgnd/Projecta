import React from "react";
import Text from "./Text";
import { motion, AnimatePresence } from "framer-motion";
import "./ProjectOverlay.css";

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
        return (
            <div className="project-settings-panel">
                {/* 1. Informations générales */}
                <div className="project-settings-section-title">
                    <Text size={20} bold>📝 Informations générales</Text>
                </div>
                <div className="project-settings-row">
                    <Text size={14} bold>Nom du projet</Text>
                    <input type="text" value={project?.name || ""} disabled />
                </div>
                <div className="project-settings-row">
                    <Text size={14} bold>Description courte</Text>
                    <textarea value={project?.description || ""} disabled />
                </div>
                <div className="project-settings-row">
                    <Text size={14} bold>Objectif du projet</Text>
                    <textarea value={project?.goal || ""} disabled />
                </div>
                <div className="project-settings-row">
                    <Text size={14} bold>Tags / catégories</Text>
                    <input type="text" value={project?.tags?.join(", ") || ""} disabled />
                </div>

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
                        style={{ alignItems: "stretch" }}
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
                        <div className="project-overlay-details" style={{ alignItems: "flex-start" }}>
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