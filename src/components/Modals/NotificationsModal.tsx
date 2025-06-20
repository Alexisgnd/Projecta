import React from "react";
import Modal from "./Modal";
import Text from "../Elements/Text";
import "./NotificationsModal.css";

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
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ notifications, onClose }) => (
    <Modal onClose={onClose}>
        <div className="notifications-modal-root">
            <Text size={22} bold>Notifications</Text>
            <div className="notifications-table">
                <div className="notifications-table-header">
                    <Text size={16} bold>Titre</Text>
                    <Text size={16} bold>Message</Text>
                    <Text size={16} bold>Date</Text>
                    <Text size={16} bold>Statut</Text>
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
                        </div>
                    ))
                )}
            </div>
        </div>
    </Modal>
);

export default NotificationsModal;