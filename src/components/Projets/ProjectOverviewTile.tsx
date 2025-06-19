import React from "react";
import "./ProjectOverviewTile.css";

interface ProjectOverviewTileProps {
    icon?: React.ReactNode;
    title: string;
    value: React.ReactNode;
    description?: string;
    onClick?: () => void;
}

const ProjectOverviewTile: React.FC<ProjectOverviewTileProps> = ({
    icon,
    title,
    value,
    description,
    onClick,
}) => (
    <div className="project-overview-tile" onClick={onClick}>
        {icon && <div className="project-overview-tile-icon">{icon}</div>}
        <div className="project-overview-tile-content">
            <div className="project-overview-tile-title">{title}</div>
            <div className="project-overview-tile-value">{value}</div>
            {description && <div className="project-overview-tile-description">{description}</div>}
        </div>
    </div>
);

export default ProjectOverviewTile;