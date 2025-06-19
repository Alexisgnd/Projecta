import React from "react";
import "../User Profile/UserStatus.css";
import { UserStatusDot } from "../User Profile/UserStatus";

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    picture_url?: string;
    status?: string;
    role?: string;
}

interface ProjectMembersBarProps {
    members: Member[];
    onMemberClick?: (member: Member) => void;
}

const ProjectMembersBar: React.FC<ProjectMembersBarProps> = ({ members, onMemberClick }) => (
    <aside className="project-members-bar">
        <div className="project-members-bar-header">
            Membres du projet ({members.length})
        </div>
        <div className="project-members-bar-list">
            {members.map(member => (
                <div
                    key={member.id}
                    className="project-members-bar-item"
                    onClick={() => onMemberClick && onMemberClick(member)}
                >
                    <div className="project-member-avatar">
                        <img
                            src={member.picture_url || "/assets/avatar1.png"}
                            alt={`${member.first_name} ${member.last_name}`}
                        />
                        <span className="project-member-status-dot">
                            <UserStatusDot status={member.status} />
                        </span>
                    </div>
                    <div className="project-members-bar-info">
                        <span className="project-members-bar-name">
                            {member.first_name} {member.last_name}
                        </span>
                        {member.role && (
                            <span className="project-members-bar-role">{member.role}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </aside>
);

export default ProjectMembersBar;