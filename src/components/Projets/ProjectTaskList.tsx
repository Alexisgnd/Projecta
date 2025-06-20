import React, { useEffect, useState } from "react";
import supabase from "../../supabaseClient";
import Text from "../Elements/Text";
import Button from "../Buttons/Button";
import CreateTaskModal from "../Modals/CreateTaskModal";
import "./ProjectTaskList.css";
import { Task } from "../../InterfaceTask";

interface ProjectTaskListProps {
    projectId: number;
    refreshKey?: number;
    onTaskChanged?: () => void; // Ajoute cette ligne
}

const ProjectTaskList: React.FC<ProjectTaskListProps> = ({ projectId, refreshKey, onTaskChanged }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Nouveaux états pour l'édition
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            const { data } = await supabase
                .from("tasks")
                .select("*")
                .eq("project_id", projectId)
                .order("due_date", { ascending: true });
            setTasks(data || []);
            setLoading(false);
        };
        fetchTasks();
    }, [projectId, refreshKey]);

    if (loading) return <Text size={16} color="secondary">Chargement des tâches...</Text>;
    if (tasks.length === 0) return <Text size={16} color="secondary">Aucune tâche pour ce projet.</Text>;

    return (
        <div className="project-task-list-grid">
            {tasks.map(task => (
                <div className="project-task-card" key={task.id}>
                    <div className="project-task-header">
                        <Text size={18} bold>{task.title}</Text>
                        <span
                            className={`project-task-status status-${task.status.replace(/\s/g, '').toLowerCase()}`}
                        >
                            {task.status}
                        </span>
                        <span
                            className={`project-task-priority priority-${task.priority.replace(/\s/g, '').toLowerCase()}`}
                        >
                            {task.priority}
                        </span>
                    </div>
                    {task.description && (
                        <div className="project-task-desc">{task.description}</div>
                    )}
                    <div className="project-task-footer">
                        {task.due_date && (
                            <span className="project-task-due">
                                Échéance : {new Date(task.due_date).toLocaleDateString()}
                            </span>
                        )}
                        <div className="project-task-actions">
                            <Button
                                text="Modifier"
                                variant="secondary"
                                size="small"
                                onClick={() => {
                                    setEditTask(task);
                                    setShowEditModal(true);
                                }}
                            />
                            <Button
                                text="Supprimer"
                                variant="failure"
                                size="small"
                                onClick={async () => {
                                    await supabase
                                        .from("tasks")
                                        .delete()
                                        .eq("id", task.id);
                                    setTasks(tasks => tasks.filter(t => t.id !== task.id));
                                    if (onTaskChanged) onTaskChanged(); // Ajoute ceci
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))}
            {/* Modal d'édition */}
            {showEditModal && editTask && (
                <CreateTaskModal
                    projectId={projectId}
                    assignerId={editTask.assigner || null}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditTask(null);
                    }}
                    onTaskCreated={() => {
                        setShowEditModal(false);
                        setEditTask(null);
                        // Rafraîchit la liste
                        const fetchTasks = async () => {
                            setLoading(true);
                            const { data } = await supabase
                                .from("tasks")
                                .select("*")
                                .eq("project_id", projectId)
                                .order("due_date", { ascending: true });
                            setTasks(data || []);
                            setLoading(false);
                        };
                        fetchTasks();
                    }}
                    // Passe la tâche à éditer en prop (à ajouter dans CreateTaskModal)
                    task={editTask}
                    isEdit
                />
            )}
        </div>
    );
};

export default ProjectTaskList;