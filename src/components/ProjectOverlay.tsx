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
        // Réinitialise la tab sélectionnée à l'ouverture d'un projet
        setSelectedTab(0);
    }, [project]);

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
                            <Text size={20}>
                                {project.num_tasks} tâche{project.num_tasks > 1 ? "s" : ""}
                            </Text>
                            <Text size={20}>
                                Progression : {project.progression}%
                            </Text>
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