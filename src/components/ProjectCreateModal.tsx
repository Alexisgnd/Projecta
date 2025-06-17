import React, { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import TagInput from "./TagInput";
import supabase from "../supabaseClient";
import Text from "./Text";
import "./ProjectCreateModal.css";

const defaultColor = "#a259ff";

interface ProjectCreateModalProps {
    onClose: () => void;
    onCreated: (project: any) => void;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({ onClose, onCreated }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(defaultColor);
    const [tags, setTags] = useState<string[]>([]);
    const [tagsColors, setTagsColors] = useState<{ [key: string]: string }>({});
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        // Récupère l'id utilisateur
        if (!user || !user.email) {
            setError("Utilisateur non authentifié");
            return;
        }
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();
        const userId = userData?.id;
        if (!userId) {
            setError("Impossible de trouver l'utilisateur");
            return;
        }
        const { data, error: insertError } = await supabase
            .from("projects")
            .insert([{
                user_id: userId,
                name,
                description,
                color,
                tags,
                tags_colors: tagsColors,
                start: start ? new Date(start).toISOString() : null,
                end: end ? new Date(end).toISOString() : null,
                progression: 0,
                num_tasks: 0,
                num_members: 1,
            }])
            .select("*")
            .single();
        if (insertError) {
            setError("Erreur lors de la création du projet");
        } else {
            onCreated(data);
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="project-create-modal-root">
                <Text size={24} bold>Créer un nouveau projet</Text>
                <div className="project-create-modal-form">
                    <Input header="Nom du projet" value={name} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setName(e.target.value)} />
                    <Input header="Couleur" type="color" value={color} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setColor(e.target.value)} />
                    <Input header="Description" value={description} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setDescription(e.target.value)} type="textarea" />
                    <TagInput header="Tags (séparés avec virgules)" tags={tags} setTags={setTags} tagsColors={tagsColors} setTagsColors={setTagsColors} />
                    <Input header="Date de début" type="date" value={start} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setStart(e.target.value)} />
                    <Input header="Date de fin" type="date" value={end} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setEnd(e.target.value)} />
                </div>
                {error && <Text color="danger">{error}</Text>}
                <div className="project-create-modal-actions">
                    <Button text="Annuler" variant="failure" onClick={onClose} />
                    <Button text="Créer" variant="primary" onClick={handleCreate} />
                </div>
            </div>
        </Modal>
    );
};

export default ProjectCreateModal;