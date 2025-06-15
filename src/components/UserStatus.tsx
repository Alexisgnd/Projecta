import React from "react";
import "./UserStatus.css";

export type UserStatusKey = "online" | "busy" | "away" | "invisible" | "dnd";

export interface UserStatusDef {
    key: UserStatusKey;
    label: string;
    color: string;
}

export const USER_STATUSES: UserStatusDef[] = [
    { key: "online", label: "En ligne", color: "#4ade80" },
    { key: "busy", label: "Occupé", color: "#f87171" },
    { key: "away", label: "Absent", color: "#facc15" },
    { key: "invisible", label: "Invisible", color: "#a3a3a3" },
    { key: "dnd", label: "Ne pas déranger", color: "#ef4444" },
];

export function getUserStatusDef(status?: string): UserStatusDef {
    return USER_STATUSES.find((s) => s.key === status) || USER_STATUSES[0];
}

export const UserStatusDot: React.FC<{ status?: string; className?: string }> = ({
    status,
    className = "",
}) => {
    const def = getUserStatusDef(status);
    return (
        <span
            className={`user-status-dot ${className}`}
            style={{ background: def.color }}
            title={def.label}
        />
    );
};