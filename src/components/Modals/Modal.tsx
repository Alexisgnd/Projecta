import React from "react";
import "./Modal.css";

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
    backdropClassName?: string;
    contentClassName?: string; // Ajoute cette prop
}

const Modal: React.FC<ModalProps> = ({ onClose, children, backdropClassName, contentClassName }) => (
    <div className={backdropClassName || "modal-backdrop"} onClick={onClose}>
        <div className={`modal-content${contentClassName ? " " + contentClassName : ""}`} onClick={e => e.stopPropagation()}>
            <button
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Fermer"
            >×</button>
            {children}
        </div>
    </div>
);

export default Modal;