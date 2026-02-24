
import type {
  BoardColumn,
  BoardUser,
  BoardMilestone,
  BoardTask,
  BoardTag,
} from "./types";

// View

export const VIEW_TYPE = "milestone-board";

// Default Structure

export const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: "todo", label: "📋 To Do", color: "#4f6ef7" },
  { id: "inprog", label: "🔄 In Progress", color: "#9b59b6" },
  { id: "review", label: "👀 In Review", color: "#06b6d4" },
  { id: "done", label: "✅ Done", color: "#10b981" },
  { id: "backlog", label: "⏳ Backlog", color: "#f59e0b" },
];

export const DEFAULT_USERS: BoardUser[] = [];

export const DEFAULT_MILESTONES: BoardMilestone[] = [];

export const DEFAULT_TAGS: BoardTag[] = [];

export const SEED_TASKS: BoardTask[] = [];

// Plugin Settings

export interface MilestoneSettings {
  dataFile: string;
}

export const DEFAULT_SETTINGS: MilestoneSettings = {
  dataFile: "milestone-board.json",
};
