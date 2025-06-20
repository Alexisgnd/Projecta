import React from "react";
import Modal from "./Modal";
import Text from "../Elements/Text";
import "./NotificationsModal.css";
import Button from "../Buttons/Button";

interface Notification {
    id: number;
    title: string;
    content: string;
    created_at: string;
    read: boolean;
}

interface NotificationsModalProps {
    notifications: Notification[];
    onClose: () => void;
    onDelete: (id: number) => void;
    onDeleteAll: () => void;
    onMarkAsRead: (id: number) => void;
    onShowDetails: (notif: Notification) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
    notifications,
    onClose,
    onDelete,
    onDeleteAll,
    onMarkAsRead,
    onShowDetails
}) => (
    <Modal onClose={onClose}>
        <div className="notifications-modal-root">
            <div className="notifications-modal-header">
                <Text size={22} bold>Notifications</Text>
                <div className="notif-header-actions">
                    {notifications.length > 0 && (
                        <Button
                            text="Tout supprimer"
                            variant="failure"
                            size="small"
                            onClick={onDeleteAll}
                            title="Tout supprimer"
                            prefixIcon={<span>🗑️</span>}
                        />
                    )}
                    <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">×</button>
                </div>
            </div>
            <div className="notifications-table">
                <div className="notifications-table-header">
                    <Text size={16} bold>Titre</Text>
                    <Text size={16} bold>Message</Text>
                    <Text size={16} bold>Date</Text>
                    <Text size={16} bold>Statut</Text>
                    <Text size={16} bold>Actions</Text>
                </div>
                {notifications.length === 0 ? (
                    <div className="notifications-table-row empty">
                        <Text size={15} color="secondary">Aucune notification.</Text>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div className={`notifications-table-row${notif.read ? " read" : ""}`} key={notif.id}>
                            <Text className="notif-title" size={15} bold>{notif.title}</Text>
                            <Text className="notif-content" size={15}>{notif.content}</Text>
                            <Text className="notif-date" size={14} color="secondary">{new Date(notif.created_at).toLocaleString()}</Text>
                            <Text
                                className={`notif-status${notif.read ? " read" : " unread"}`}
                                size={14}
                                bold
                                color={notif.read ? "success" : "warning"}
                            >
                                {notif.read ? "Lue" : "Non lue"}
                            </Text>
                            <div style={{ display: "flex", gap: 6 }}>
                                {!notif.read && (
                                    <Button
                                        text=""
                                        variant="success"
                                        size="small"
                                        onClick={() => onMarkAsRead(notif.id)}
                                        title="Marquer comme lue"
                                        prefixIcon={<span>✔️</span>}
                                    />
                                )}
                                <Button
                                    text=""
                                    variant="secondary"
                                    size="small"
                                    onClick={() => onShowDetails(notif)}
                                    title="Voir détails"
                                    prefixIcon={<span>🔍</span>}
                                />
                                <Button
                                    text=""
                                    variant="failure"
                                    size="small"
                                    onClick={() => onDelete(notif.id)}
                                    title="Supprimer"
                                    prefixIcon={<span>🗑️</span>}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </Modal>
);

export default NotificationsModal;