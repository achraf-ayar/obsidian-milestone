
import { BoardTask, BoardData, BoardFilters } from "../src/types";
import { matchesFilter } from "../utils/filters";

// ─── Card Component ───────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};
const PRIORITY_ICON: Record<string, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

export interface CardCallbacks {
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
}

export function buildCard(
  task: BoardTask,
  data: BoardData,
  filters: BoardFilters,
  cb: CardCallbacks,
): HTMLElement {
  const hidden = !matchesFilter(task, filters);
  const priColor = PRIORITY_COLOR[task.priority] ?? "#888";
  const priIcon = PRIORITY_ICON[task.priority] ?? "";

  const card = document.createElement("div");
  card.className = "ms-card" + (hidden ? " ms-hidden" : "");
  card.dataset.id = task.id;
  card.draggable = true;

  card.addEventListener("dragstart", () => {
    cb.onDragStart(task.id);
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    cb.onDragEnd();
    card.classList.remove("dragging");
  });

  // Priority left bar
  const priBar = document.createElement("div");
  priBar.className = "ms-pri-bar";
  priBar.style.background = priColor;
  card.appendChild(priBar);

  // Action buttons (visible on hover)
  const actions = document.createElement("div");
  actions.className = "ms-card-actions";

  const editBtn = document.createElement("div");
  editBtn.className = "ms-card-btn";
  editBtn.title = "Edit";
  editBtn.textContent = "✏️";
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    cb.onEdit(task.id);
  });

  const delBtn = document.createElement("div");
  delBtn.className = "ms-card-btn del";
  delBtn.title = "Delete";
  delBtn.textContent = "🗑";
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    cb.onDelete(task.id);
  });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  card.appendChild(actions);

  // Title
  const title = document.createElement("div");
  title.className = "ms-card-title";
  title.textContent = task.title;
  card.appendChild(title);

  // Meta badges
  const meta = document.createElement("div");
  meta.className = "ms-card-meta";

  // Priority badge
  const priBadge = document.createElement("span");
  priBadge.className = `ms-badge ms-badge-${task.priority}`;
  priBadge.textContent = `${priIcon} ${task.priority}`;
  meta.appendChild(priBadge);

  // Milestone badge — uses milestone colour
  if (task.milestone) {
    const ms = data.milestones.find((m) => m.name === task.milestone);
    const msColor = ms?.color ?? "#3b82f6";
    const mileBadge = document.createElement("span");
    mileBadge.className = "ms-badge";
    mileBadge.style.cssText = `
			background: color-mix(in srgb, ${msColor} 15%, transparent);
			color: ${msColor};
			border: 1px solid color-mix(in srgb, ${msColor} 35%, transparent);
		`;
    mileBadge.textContent = `🏁 ${task.milestone}`;
    meta.appendChild(mileBadge);
  }

  // Assignee badge — uses user colour
  if (task.assignee) {
    const user = data.users.find((u) => u.name === task.assignee);
    const uColor = user?.color ?? "#5eead4";
    const assignBadge = document.createElement("span");
    assignBadge.className = "ms-badge";
    assignBadge.style.cssText = `
			background: color-mix(in srgb, ${uColor} 15%, transparent);
			color: ${uColor};
			border: 1px solid color-mix(in srgb, ${uColor} 35%, transparent);
		`;
    assignBadge.textContent = `👤 ${task.assignee}`;
    meta.appendChild(assignBadge);
  }

  // Tag badges
  (task.tags ?? []).forEach((tag) => {
    const tagBadge = document.createElement("span");
    tagBadge.className = "ms-badge ms-badge-tag";
    tagBadge.textContent = `#${tag}`;
    meta.appendChild(tagBadge);
  });

  card.appendChild(meta);
  return card;
}
