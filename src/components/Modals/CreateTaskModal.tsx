import React, { useState } from "react";
import Modal from "./Modal";
import Input from "../Elements/Input";
import Button from "../Buttons/Button";
import supabase from "../../supabaseClient";
import Text from "../Elements/Text";
import "./CreateTaskModal.css";
import { Task } from "../../InterfaceTask";

interface CreateTaskModalProps {
    projectId: number;
    assignerId: number | null;
    onClose: () => void;
    onTaskCreated: () => void;
    task?: Task;
    isEdit?: boolean;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
    projectId,
    assignerId,
    onClose,
    onTaskCreated,
    task,
    isEdit
}) => {
    const [title, setTitle] = useState(task?.title || "");
    const [description, setDescription] = useState(task?.description || "");
    const [status, setStatus] = useState(task?.status || "À faire");
    const [priority, setPriority] = useState(task?.priority || "Moyenne");
    const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.slice(0, 10) : "");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !assignerId) return;
        setLoading(true);

        if (isEdit && task) {
            // Mode édition
            const { error } = await supabase.from("tasks").update({
                title,
                description,
                status,
                priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                project_id: projectId,
                assigner: assignerId
            }).eq("id", task.id);

            setLoading(false);
            if (!error) {
                onTaskCreated();
            } else {
                alert("Erreur lors de la modification de la tâche.");
            }
        } else {
            // Mode création
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
        }
    };

    return (
        <Modal onClose={onClose}>
            <form className="create-task-modal" onSubmit={handleSubmit}>
                <Text size={22} bold>{isEdit ? "Modifier la tâche" : "Créer une nouvelle tâche"}</Text>
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
                        text={loading ? (isEdit ? "Modification..." : "Création...") : (isEdit ? "Modifier" : "Créer")}
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
