import React from 'react';
import './ProjectCard.css';

// Ajoute cette fonction utilitaire en haut du fichier
function isColorLight(hex: string): boolean {
  // Enlève le # si présent
  hex = hex.replace('#', '');
  // Convertit en RGB
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  // Calcul de la luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7; // seuil à ajuster si besoin
}

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
  backgroundColor = "#a259ff",
}) => {
  // Détermine la couleur du texte selon le fond
  const textColor = isColorLight(backgroundColor.replace(/[^#a-fA-F0-9]/g, '')) ? "#222" : "#fff";

  return (
    <div
      className="project-card"
      style={{ background: backgroundColor, color: textColor }}
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
      <div className="project-card-title" style={{ color: textColor }}>{title}</div>
      <div className="project-card-info">
        <span>
          {tasks} Tâche{tasks > 1 ? 's' : ''}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="project-card-progress-bar">
        <div
          className="project-card-progress"
          style={{ width: `${progress}%` }}
        />
        <div
          className="project-card-progress-circle"
          style={{
            left: `calc(${progress}% - 10px)`, // Centrage du rond
            display: progress === 0 ? 'none' : undefined // Cache le rond si 0%
          }}
        />
      </div>
    </div>
  );
};

export default ProjectCard;