import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Text from "./Text";
import Button from "./Button";
import { FaCheck } from "react-icons/fa";
import "./ProjectOverlay.css";

interface Project {
    id: number;
    name: string;
    color: string;
    progression: number;
    num_tasks: number;
    description?: string;
    num_members?: number;
    tags?: string[];
    tags_colors?: { [key: string]: string };
    status?: string;
    start?: string;
    end?: string;
}

interface ProjectOverlayProps {
    project: Project | null;
    onClose: () => void;
}

const ProjectOverlay: React.FC<ProjectOverlayProps> = ({ project, onClose }) => {
    const [selectedTab, setSelectedTab] = React.useState(0);

    // Ajout des états pour tous les champs
    const [name, setName] = React.useState(project?.name || "");
    const [description, setDescription] = React.useState(project?.description || "");
    const [progression, setProgression] = React.useState(project?.progression || 0);
    const [color, setColor] = React.useState(project?.color || "#a259ff");
    const [numTasks, setNumTasks] = React.useState(project?.num_tasks || 0);
    const [numMembers, setNumMembers] = React.useState(project?.num_members || 1);
    const [tags, setTags] = React.useState<string[]>(project?.tags || []);
    const [tagsColors, setTagsColors] = React.useState<{ [key: string]: string }>(project?.tags_colors || {});
    const [status, setStatus] = React.useState(project?.status || "");
    const [start, setStart] = React.useState(project?.start ? project.start.substring(0, 10) : "");
    const [end, setEnd] = React.useState(project?.end ? project.end.substring(0, 10) : "");

    // Remet à jour les états quand le projet change
    useEffect(() => {
        setSelectedTab(0);
        setName(project?.name || "");
        setDescription(project?.description || "");
        setProgression(project?.progression || 0);
        setColor(project?.color || "#a259ff");
        setNumTasks(project?.num_tasks || 0);
        setNumMembers(project?.num_members || 1);
        setTags(project?.tags || []);
        setTagsColors(project?.tags_colors || {});
        setStatus(project?.status || "");
        setStart(project?.start ? project.start.substring(0, 10) : "");
        setEnd(project?.end ? project.end.substring(0, 10) : "");
    }, [project]);

    // Handler mock pour la validation
    const handleSave = () => {
        // Ici tu peux ajouter la logique de sauvegarde plus tard
        alert("Changements validés (mock)");
    };

    // Simple gestion des tags (séparés par virgule)
    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTags(e.target.value.split(",").map(t => t.trim()).filter(Boolean));
    };

    // Simple gestion des couleurs de tags (clé:valeur séparés par virgule)
    const handleTagsColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const obj = JSON.parse(e.target.value);
            setTagsColors(obj);
        } catch {
            setTagsColors({});
        }
    };

    const tabs = [
        "📌 Vue d’ensemble",
        "🧾 Tâches / Kanban",
        "📊 Indicateurs & KPI",
        "🗓️ Planning / Gantt",
        "📂 Documents du projet",
        "📒 Journal de bord",
        "⚙️ Paramètres du projet",
    ];

    return (
        <AnimatePresence>
            {project && (
                <motion.div
                    className="project-overlay"
                    initial={{ borderRadius: 32, scale: 0.9, opacity: 0 }}
                    animate={{ borderRadius: 0, scale: 1, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ background: color }}
                    onClick={onClose}
                >
                    <div
                        className="project-overlay-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="project-overlay-header">
                            <Text size={40} bold>
                                {name}
                            </Text>
                        </header>

                        {/* Onglets */}
                        <nav className="project-overlay-tabs">
                            {tabs.map((tab, idx) => (
                                <button
                                    key={tab}
                                    className={`project-overlay-tab${selectedTab === idx ? " selected" : ""}`}
                                    onClick={() => setSelectedTab(idx)}
                                    type="button"
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>

                        {/* Contenu de l’onglet */}
                        <div className="project-overlay-details">
                            {selectedTab === 6 ? (
                                <form
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 16,
                                        maxWidth: 500,
                                    }}
                                    onSubmit={e => { e.preventDefault(); handleSave(); }}
                                >
                                    <label>
                                        Nom du projet
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        Description
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        Progression (%)
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={progression}
                                            onChange={e => setProgression(Number(e.target.value))}
                                        />
                                    </label>
                                    <label>
                                        Couleur
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={e => setColor(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        Nombre de tâches
                                        <input
                                            type="number"
                                            min={0}
                                            value={numTasks}
                                            onChange={e => setNumTasks(Number(e.target.value))}
                                        />
                                    </label>
                                    <label>
                                        Nombre de membres
                                        <input
                                            type="number"
                                            min={1}
                                            value={numMembers}
                                            onChange={e => setNumMembers(Number(e.target.value))}
                                        />
                                    </label>
                                    <label>
                                        Tags (séparés par des virgules)
                                        <input
                                            type="text"
                                            value={tags.join(", ")}
                                            onChange={handleTagsChange}
                                            placeholder="ex: urgent, client, interne"
                                        />
                                    </label>
                                    <label>
                                        Couleurs des tags (JSON)
                                        <input
                                            type="text"
                                            value={JSON.stringify(tagsColors)}
                                            onChange={handleTagsColorsChange}
                                            placeholder='ex: {"urgent":"#ff0000"}'
                                        />
                                    </label>
                                    <label>
                                        Statut
                                        <select
                                            value={status}
                                            onChange={e => setStatus(e.target.value)}
                                        >
                                            <option value="">-- Choisir --</option>
                                            <option value="en cours">En cours</option>
                                            <option value="en pause">En pause</option>
                                            <option value="terminé">Terminé</option>
                                            <option value="annulé">Annulé</option>
                                        </select>
                                    </label>
                                    <label>
                                        Date de début
                                        <input
                                            type="date"
                                            value={start}
                                            onChange={e => setStart(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        Date de fin
                                        <input
                                            type="date"
                                            value={end}
                                            onChange={e => setEnd(e.target.value)}
                                        />
                                    </label>
                                </form>
                            ) : (
                                <>
                                    <Text size={20}>
                                        {project.num_tasks} tâche
                                        {project.num_tasks > 1 ? "s" : ""}
                                    </Text>
                                    <Text size={20}>Progression : {project.progression}%</Text>
                                </>
                            )}
                        </div>

                        {/* Bouton de validation en bas à droite sur l’onglet paramètres */}
                        {selectedTab === 6 && (
                            <div style={{
                                position: "absolute",
                                right: 32,
                                bottom: 32,
                            }}>
                                <Button
                                    text="Valider les changements"
                                    variant="success"
                                    onClick={handleSave}
                                    prefixIcon={<FaCheck />}
                                />
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProjectOverlay;
