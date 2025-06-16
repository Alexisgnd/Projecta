import React from "react";
import "./Modal.css";

const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
    <div className="modal-backdrop" onClick={onClose}>
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