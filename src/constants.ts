
import { uid } from "../utils/uid";
import type {
  BoardColumn,
  BoardUser,
  BoardMilestone,
  BoardTask,
} from "./types";

// ─── View ─────────────────────────────────────────────────────────────────────

export const VIEW_TYPE = "milestone-board";

// ─── Default Structure ────────────────────────────────────────────────────────

export const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: "todo", label: "📋 To Do", color: "#4f6ef7" },
  { id: "inprog", label: "🔄 In Progress", color: "#9b59b6" },
  { id: "review", label: "👀 In Review", color: "#06b6d4" },
  { id: "done", label: "✅ Done", color: "#10b981" },
  { id: "backlog", label: "⏳ Backlog", color: "#f59e0b" },
];

export const DEFAULT_USERS: BoardUser[] = [
  { id: uid(), name: "@adam", color: "#5eead4", initials: "AD" },
  { id: uid(), name: "@sarah", color: "#c084fc", initials: "SA" },
];

export const DEFAULT_MILESTONES: BoardMilestone[] = [
  {
    id: uid(),
    name: "M1",
    label: "Foundation",
    color: "#4f6ef7",
    order: 1,
    dueDate: "",
  },
  {
    id: uid(),
    name: "M2",
    label: "Core",
    color: "#10b981",
    order: 2,
    dueDate: "",
  },
  {
    id: uid(),
    name: "M3",
    label: "Polish",
    color: "#f59e0b",
    order: 3,
    dueDate: "",
  },
];

export const SEED_TASKS: BoardTask[] = [
  {
    id: uid(),
    col: "todo",
    title: "Terminer la saisie pour ITZENATA",
    desc: "",
    assignee: "@adam",
    milestone: "M1",
    priority: "high",
    tags: ["client"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "done",
    title: "Saisi automatique des comptes",
    desc: "",
    assignee: "@sarah",
    milestone: "M1",
    priority: "medium",
    tags: ["feature"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "done",
    title: "Import ITZENATA",
    desc: "",
    assignee: "@adam",
    milestone: "M1",
    priority: "high",
    tags: ["client", "import"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "done",
    title: "Import vers GCP",
    desc: "",
    assignee: "@sarah",
    milestone: "M2",
    priority: "high",
    tags: ["infrastructure"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "done",
    title: "Infra as code",
    desc: "",
    assignee: "@adam",
    milestone: "M2",
    priority: "medium",
    tags: ["infrastructure"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "done",
    title: "Gestion de stock",
    desc: "",
    assignee: "@sarah",
    milestone: "M2",
    priority: "medium",
    tags: ["feature"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "done",
    title:
      "Maintenir le saisi d'un compte qui déja existe dans le transaction form",
    desc: "",
    assignee: "@adam",
    milestone: "M2",
    priority: "high",
    tags: ["bugfix"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "done",
    title: "Ajoute d'un skeleton à les amortissements",
    desc: "",
    assignee: "@sarah",
    milestone: "M3",
    priority: "low",
    tags: ["ui"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "done",
    title: "Maintenir le dark mode sur le forumlaire d'entreprise",
    desc: "",
    assignee: "@adam",
    milestone: "M3",
    priority: "low",
    tags: ["ui"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "done",
    title: "Letter Logo",
    desc: "",
    assignee: "@sarah",
    milestone: "M3",
    priority: "low",
    tags: ["ui"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "backlog",
    title: "Clerk",
    desc: "",
    assignee: "@adam",
    milestone: "M3",
    priority: "medium",
    tags: ["infrastructure"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "backlog",
    title: "Facture Eléctornique",
    desc: "",
    assignee: "@sarah",
    milestone: "M2",
    priority: "high",
    tags: ["feature"],
    createdAt: Date.now(),
  },
  {
    id: uid(),
    col: "backlog",
    title: "Ai agent",
    desc: "",
    assignee: "@adam",
    milestone: "M3",
    priority: "medium",
    tags: ["ai"],
    createdAt: Date.now(),
  },
];

// ─── Plugin Settings ──────────────────────────────────────────────────────────

export interface MilestoneSettings {
  dataFile: string;
}

export const DEFAULT_SETTINGS: MilestoneSettings = {
  dataFile: "milestone-board.json",
};
