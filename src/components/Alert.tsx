import React, { useEffect, useState } from "react";
import "./Alert.css";

type AlertType = "error" | "success" | "info" | "warning";

interface AlertProps {
    type: AlertType;
    title: string;
    children: React.ReactNode;
    onClose?: () => void;
}

const icons: Record<AlertType, React.ReactNode> = {
    error: (
        <span className="alert-icon error">
            &#10006;
        </span>
    ),
    success: (
        <span className="alert-icon success">
            &#10003;
        </span>
    ),
    info: (
        <span className="alert-icon info">
            i
        </span>
    ),
    warning: (
        <span className="alert-icon warning">
            !
        </span>
    ),
};

const Alert: React.FC<AlertProps> = ({ type, title, children, onClose }) => {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        // Start animation in
        setTimeout(() => setVisible(true), 100);

        // Auto close after 15s
        const timer = setTimeout(() => handleClose(), 15000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line
    }, []);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, 400); // match fade duration
    };

    if (!visible && !closing) return null;

    return (
        <div
            className={`alert alert-${type} alert-floating${visible && !closing ? " alert-in" : ""}${closing ? " alert-out" : ""}`}
        >
            <button className="alert-close" onClick={handleClose} aria-label="Fermer">
                &times;
            </button>
            {icons[type]}
            <div className="alert-content">
                <div className="alert-title">{title}</div>
                <div className="alert-message">{children}</div>
            </div>
        </div>
    );
};

export default Alert;