import React, { useEffect, useState } from "react";
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
    const [assignedTo, setAssignedTo] = useState(task?.assigned_to || "");
    const [members, setMembers] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Récupère les membres du projet
        const fetchMembers = async () => {
            const { data: memberLinks } = await supabase
                .from("project_members")
                .select("user_id")
                .eq("project_id", projectId);
            const userIds = (memberLinks || []).map(m => m.user_id);
            if (userIds.length > 0) {
                const { data: usersData } = await supabase
                    .from("users")
                    .select("id, first_name, last_name, picture_url")
                    .in("id", userIds);
                setMembers(usersData || []);
            } else {
                setMembers([]);
            }
        };
        fetchMembers();
    }, [projectId]);

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
                assigner: assignerId,
                assigned_to: assignedTo || null // <-- AJOUT ICI
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
                assigner: assignerId,
                assigned_to: assignedTo || null
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
                <div className="create-task-inline">
                    <Input
                        header="Titre *"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                    <Input
                        header="Assigner à *"
                        type="select"
                        value={assignedTo.toString()}
                        onChange={e => setAssignedTo(Number(e.target.value))}
                        required
                        options={[
                            { value: "", label: "Sélectionner un membre" },
                            ...members.map(member => ({
                                value: member.id,
                                label: `${member.first_name} ${member.last_name}`
                            }))
                        ] as { value: string | number; label: string }[]}
                    />
                </div>
                <Input
                    header="Description"
                    value={description}
                    onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setDescription(e.target.value)}
                    type="textarea"
                />
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
