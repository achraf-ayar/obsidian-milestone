// ─── Domain Types ────────────────────────────────────────────────────────────

export interface BoardTask {
  id: string;
  col: string;
  title: string;
  desc: string;
  assignee: string;
  milestone: string;
  priority: "high" | "medium" | "low";
  tags: string[];
  createdAt: number;
}

export interface BoardColumn {
  id: string;
  label: string;
  color: string;
}

export interface BoardUser {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface BoardMilestone {
  id: string;
  name: string;
  label: string;
  color: string;
  order: number;
  dueDate: string;
}

export interface BoardData {
  tasks: BoardTask[];
  columns: BoardColumn[];
  users: BoardUser[];
  milestones: BoardMilestone[];
}

export interface BoardFilters {
  search: string;
  assignee: string;
  milestone: string;
  priority: string;
  tag: string;
}

export type ActivePanel = "users" | "milestones" | null;
