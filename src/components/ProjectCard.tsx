import React from 'react';
import './ProjectCard.css';

interface ProjectCardProps {
  title: string;
  tasks: number;
  progress: number; // 0-100
  members: string[]; // URLs des avatars
  extraMembers?: number;
  backgroundColor?: string; // Ajout de la prop
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  tasks,
  progress,
  members,
  extraMembers = 0,
  backgroundColor = "#a259ff", // Valeur par défaut
}) => {
  return (
    <div
      className="project-card"
      style={{ background: backgroundColor }}
    >
      <div className="project-card-folder-shape" />
      <div className="project-card-members">
        {members.slice(0, 3).map((avatar, i) => (
          <img
            key={i}
            src={avatar}
            alt=""
            className="project-card-avatar"
            style={{ left: `${i * 24}px` }}
          />
        ))}
        {extraMembers > 0 && (
          <div className="project-card-extra" style={{ left: `${members.slice(0, 3).length * 24}px` }}>
            {extraMembers}+
          </div>
        )}
      </div>
      <div className="project-card-title">{title}</div>
      <div className="project-card-info">
        <span>{tasks} Task</span>
        <span>{progress}%</span>
      </div>
      <div className="project-card-progress-bar">
        <div
          className="project-card-progress"
          style={{ width: `${progress}%` }}
        />
        <div
          className="project-card-progress-circle"
          style={{ left: `calc(${progress}% - 12px)` }}
        />
      </div>
    </div>
  );
};

export default ProjectCard;