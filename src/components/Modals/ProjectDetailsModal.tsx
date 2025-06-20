import React from "react";
import Modal from "./Modal";
import Text from "../Elements/Text";
import "./ProjectDetailsModal.css";

interface ProjectDetailsModalProps {
    project: {
        name: string;
        description?: string;
        progression?: number;
        status?: string;
        color?: string;
        start?: string;
        end?: string;
        tags?: string[];
        tags_colors?: { [tag: string]: string };
    } | null;
    onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, onClose }) => {
    if (!project) return null;

    return (
        <Modal onClose={onClose}>
            <div className="project-details-modal-root">
                <div className="project-details-modal-header">
                    <Text size={22} bold>Détails du projet</Text>
                </div>
                <div className="project-details-modal-content">
                    <div className="project-details-row">
                        <Text size={16} bold>Nom :</Text>
                        <Text size={16}>{project.name}</Text>
                    </div>
                    <div className="project-details-row">
                        <Text size={16} bold>Description :</Text>
                        <Text size={16}>{project.description || "Aucune"}</Text>
                    </div>
                    <div className="project-details-row">
                        <Text size={16} bold>Progression :</Text>
                        <Text size={16}>{project.progression ?? 0}%</Text>
                    </div>
                    <div className="project-details-row">
                        <Text size={16} bold>Statut :</Text>
                        <Text size={16}>{project.status || "Non défini"}</Text>
                    </div>
                    <div className="project-details-row">
                        <Text size={16} bold>Début :</Text>
                        <Text size={16}>{project.start ? new Date(project.start).toLocaleDateString() : "Non défini"}</Text>
                    </div>
                    <div className="project-details-row">
                        <Text size={16} bold>Fin :</Text>
                        <Text size={16}>{project.end ? new Date(project.end).toLocaleDateString() : "Non défini"}</Text>
                    </div>
                    {project.tags && project.tags.length > 0 && (
                        <div className="project-details-row">
                            <Text size={16} bold>Tags :</Text>
                            <div className="project-details-tags">
                                {project.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="project-details-tag"
                                        style={{
                                            background: project.tags_colors?.[tag] || "#a259ff",
                                            color: "#fff",
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ProjectDetailsModal;