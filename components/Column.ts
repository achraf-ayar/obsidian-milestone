
import { BoardColumn, BoardData, BoardFilters } from "../src/types";
import { matchesFilter } from "../utils/filters";
import { buildCard, CardCallbacks } from "./Card";

// Column Component

export interface ColumnCallbacks extends CardCallbacks {
  onDrop: (colId: string) => void;
  onAddCard: (colId: string) => void;
}

export function buildColumn(
  col: BoardColumn,
  data: BoardData,
  filters: BoardFilters,
  cb: ColumnCallbacks,
): HTMLElement {
  const colTasks = data.tasks.filter((t) => t.col === col.id);
  const visibleCount = colTasks.filter((t) => matchesFilter(t, filters)).length;

  const el = document.createElement("div");
  el.className = "ms-col";
  el.dataset.col = col.id;

  // Drag-over highlight
  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    el.classList.add("drag-over");
  });
  el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("drag-over");
    cb.onDrop(col.id);
  });

  // Header
  const header = document.createElement("div");
  header.className = "ms-col-header";

  const titleWrap = document.createElement("div");
  titleWrap.className = "ms-col-title";

  const dot = document.createElement("span");
  dot.className = "ms-col-dot";
  dot.setCssProps({ "--ms-col-dot-bg": col.color });
  titleWrap.appendChild(dot);
  titleWrap.appendChild(document.createTextNode(col.label));

  const count = document.createElement("span");
  count.className = "ms-col-count";
  count.textContent =
    visibleCount +
    (colTasks.length !== visibleCount ? `/${colTasks.length}` : "");

  header.appendChild(titleWrap);
  header.appendChild(count);
  el.appendChild(header);

  // Card body
  const body = document.createElement("div");
  body.className = "ms-col-body";

  if (colTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "ms-empty";
    const line1 = document.createTextNode("No tasks");
    const br = document.createElement("br");
    const line2 = document.createTextNode("Drop cards here");
    empty.appendChild(line1);
    empty.appendChild(br);
    empty.appendChild(line2);
    body.appendChild(empty);
  } else {
    colTasks.forEach((task) => {
      body.appendChild(buildCard(task, data, filters, cb));
    });
  }
  el.appendChild(body);

  // Add-card button
  const addBtn = document.createElement("button");
  addBtn.className = "ms-add-card-btn";
  addBtn.textContent = "＋ Add card";
  addBtn.addEventListener("click", () => cb.onAddCard(col.id));
  el.appendChild(addBtn);

  return el;
}
