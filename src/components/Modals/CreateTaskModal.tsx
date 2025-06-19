import React, { useState } from "react";
import Modal from "./Modal";
import Input from "../Elements/Input";
import Button from "../Buttons/Button";
import supabase from "../../supabaseClient";
import Text from "../Elements/Text";

import "./CreateTaskModal.css";

interface CreateTaskModalProps {
    projectId: number;
    assignerId: number | null;
    onClose: () => void;
    onTaskCreated: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
    projectId,
    assignerId,
    onClose,
    onTaskCreated
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("À faire");
    const [priority, setPriority] = useState("Moyenne");
    const [dueDate, setDueDate] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !assignerId) return;
        setLoading(true);

        const { error } = await supabase.from("tasks").insert([{
            title,
            description,
            status,
            priority,
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
            project_id: projectId,
            assigner: assignerId
        }]);

        setLoading(false);
        if (!error) {
            onTaskCreated();
        } else {
            alert("Erreur lors de la création de la tâche.");
        }
    };

    return (
        <Modal onClose={onClose}>
            <form className="create-task-modal" onSubmit={handleSubmit}>
                <Text size={22} bold>Créer une nouvelle tâche</Text>
                <Input header="Titre *" value={title} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setTitle(e.target.value)} required />
                <Input header="Description" value={description} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setDescription(e.target.value)} type="textarea" />
                <div className="create-task-inline">
                    <Input
                        header="Statut"
                        value={status}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setStatus(e.target.value)}
                        type="select"
                        options={["À faire", "En cours", "Terminé"]}
                    />
                    <Input
                        header="Priorité"
                        value={priority}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setPriority(e.target.value)}
                        type="select"
                        options={["Basse", "Moyenne", "Haute"]}
                    />
                </div>
                <Input
                    header="Date d’échéance"
                    type="date"
                    value={dueDate}
                    onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setDueDate(e.target.value)}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                    <Button
                        text={loading ? "Création..." : "Créer"}
                        variant="success"
                        type="submit"
                        disabled={!title || loading}
                    />
                </div>
            </form>
        </Modal>
    );
};

export default CreateTaskModal;
