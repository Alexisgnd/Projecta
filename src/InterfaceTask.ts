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