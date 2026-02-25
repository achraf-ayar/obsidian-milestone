
// Filter Matching

import { BoardFilters, BoardTask } from "../src/types";

export function matchesFilter(task: BoardTask, filters: BoardFilters): boolean {
  const { search, assignee, milestone, priority, tag } = filters;

  if (search) {
    const q = search.toLowerCase();
    const inTitle = task.title.toLowerCase().includes(q);
    const inDesc = (task.desc ?? "").toLowerCase().includes(q);
    if (!inTitle && !inDesc) return false;
  }

  if (assignee && !(task.assignees ?? []).includes(assignee)) return false;
  if (milestone && task.milestone !== milestone) return false;
  if (priority && task.priority !== priority) return false;
  if (tag && !(task.tags ?? []).includes(tag)) return false;

  return true;
}

// Derive Unique Values

export function uniqueTagsFromTasks(tasks: BoardTask[]): string[] {
  return [...new Set(tasks.flatMap((t) => t.tags ?? []))];
}
