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
                            <button className="project-overlay-tab selected">📌 Vue d’ensemble</button>
                            <button className="project-overlay-tab">🧾 Tâches / Kanban</button>
                            <button className="project-overlay-tab">📊 Indicateurs & KPI</button>
                            <button className="project-overlay-tab">🗓️ Planning / Gantt</button>
                            <button className="project-overlay-tab">📂 Documents du projet</button>
                            <button className="project-overlay-tab">📒 Journal de bord</button>
                            <button className="project-overlay-tab">⚙️ Paramètres du projet</button>
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