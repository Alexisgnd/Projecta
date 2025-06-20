import React from "react";
import "./Modal.css";

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
    backdropClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, backdropClassName }) => (
    <div className={backdropClassName ? `modal-backdrop ${backdropClassName}` : "modal-backdrop"} onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
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