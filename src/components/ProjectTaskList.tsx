import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import Text from "./Text";
import "./ProjectTaskList.css";

interface Task {
    id: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    due_date: string | null;
    assigned_to: number | null;
}

interface ProjectTaskListProps {
    projectId: number;
}

const statusColors: Record<string, string> = {
    "À faire": "#f59e42",
    "En cours": "#2563eb",
    "Terminé": "#22c55e",
};

const priorityColors: Record<string, string> = {
    "Basse": "#a3e635",
    "Moyenne": "#facc15",
    "Haute": "#ef4444",
};

const ProjectTaskList: React.FC<ProjectTaskListProps> = ({ projectId }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

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
    }, [projectId]);

    if (loading) return <Text size={16} color="secondary">Chargement des tâches...</Text>;
    if (tasks.length === 0) return <Text size={16} color="secondary">Aucune tâche pour ce projet.</Text>;

    return (
        <div className="project-task-list-root">
            {tasks.map(task => (
                <div className="project-task-card" key={task.id}>
                    <div className="project-task-header">
                        <Text size={18} bold>{task.title}</Text>
                        <span
                            className="project-task-status"
                            style={{ background: statusColors[task.status] || "#e5e7eb" }}
                        >
                            {task.status}
                        </span>
                        <span
                            className="project-task-priority"
                            style={{ background: priorityColors[task.priority] || "#e5e7eb" }}
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
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectTaskList;