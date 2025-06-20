export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    due_date: string | null;
    assigned_to: number | null;
    assigner?: number | null;
}

// Types utilitaires pour enrichir une tâche localement (affichage)
export interface TaskUserInfo {
    id: number;
    first_name: string;
    last_name: string;
    picture_url?: string | null;
}

export interface TaskWithUsers extends Task {
    assigned_to_user?: TaskUserInfo | null;
    assigner_user?: TaskUserInfo | null;
}