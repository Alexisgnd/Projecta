import React, { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import TagInput from "./TagInput";
import supabase from "../supabaseClient";
import Text from "./Text";
import Alert from "./Alert";
import "./ProjectCreateModal.css";

const defaultColor = "#ffffff";

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
    const [loading, setLoading] = useState(false);

    // Alert state
    const [alert, setAlert] = useState<{
        type: "error" | "success" | "info" | "warning";
        title: string;
        message: React.ReactNode;
    } | null>(null);

    const isCreateDisabled = name.trim() === "";

    const handleCreate = async () => {
        setLoading(true);
        setAlert(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
            setAlert({
                type: "error",
                title: "Erreur",
                message: "Utilisateur non authentifié",
            });
            setLoading(false);
            return;
        }
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();
        const userId = userData?.id;
        if (!userId) {
            setAlert({
                type: "error",
                title: "Erreur",
                message: "Impossible de trouver l'utilisateur",
            });
            setLoading(false);
            return;
        }
        const { data: project, error: insertError } = await supabase
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
        if (insertError || !project) {
            setAlert({
                type: "error",
                title: "Erreur",
                message: "Erreur lors de la création du projet",
            });
            setLoading(false);
            return;
        }

        // Ajoute le créateur comme Owner dans project_members
        const { error: memberError } = await supabase
            .from("project_members")
            .insert([{
                project_id: project.id,
                user_id: userId,
                role: "Owner"
            }]);
        setLoading(false);
        if (memberError) {
            setAlert({
                type: "warning",
                title: "Projet créé",
                message: "Projet créé mais erreur lors de l'ajout du propriétaire.",
            });
        } else {
            setAlert({
                type: "success",
                title: "Succès",
                message: "Projet créé avec succès !",
            });
            setTimeout(() => {
                onCreated(project);
            }, 1200);
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="project-create-modal-root">
                <Text size={24} bold>Créer un nouveau projet</Text>
                <div className="project-create-modal-form">
                    <div className="form-row inline">
                        <Input header="Nom du projet" value={name} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setName(e.target.value)} />
                        <Input header="Couleur" type="color" value={color} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setColor(e.target.value)} />
                    </div>
                    <Input header="Description" value={description} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setDescription(e.target.value)} type="textarea" />
                    <TagInput header="Tags (séparés avec virgules)" tags={tags} setTags={setTags} tagsColors={tagsColors} setTagsColors={setTagsColors} />
                    <div className="form-row inline">
                        <Input header="Date de début" type="date" value={start} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setStart(e.target.value)} />
                        <Input header="Date de fin" type="date" value={end} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setEnd(e.target.value)} />
                    </div>
                </div>
                {alert && (
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        onClose={() => setAlert(null)}
                    >
                        {alert.message}
                    </Alert>
                )}
                <div className="project-create-modal-actions">
                    <Button text="Annuler" variant="failure" onClick={onClose} />
                    <Button
                        text="Créer"
                        variant="primary"
                        onClick={handleCreate}
                        disabled={isCreateDisabled || loading}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ProjectCreateModal;