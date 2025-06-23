import React from "react";
import { FaBell } from "react-icons/fa";
import "./NotificationButton.css";

type NotificationButtonProps = {
    count?: number;
    onClick?: () => void;
    style?: React.CSSProperties;
};

const NotificationButton = ({ count = 0, onClick, style }: NotificationButtonProps) => (
    <button
        className="notification-btn"
        onClick={onClick}
        aria-label="Notifications"
        style={style}
    >
        <FaBell size={28} />
        {count > 0 && (
            <span className="notification-badge">
                <span className="notification-badge-pulse" />
                {count}
            </span>
        )}
    </button>
);

export default NotificationButton;