import { Notice } from "obsidian";

import { uid } from "../utils/uid";
import { buildPanelHeader, sectionLabel, randomColor } from "../utils/dom";
import { openMilestoneEditModal } from "../modals/MilestoneEditModal";
import { BoardData, BoardMilestone } from "../src/types";

// --- Milestones Panel ---

export function buildMilestonesPanel(
  data: BoardData,
  onUpdate: (updated: BoardData) => void,
  onClose: () => void,
): HTMLElement {
  const panel = document.createElement("div");
  panel.className = "ms-panel";
  panel.appendChild(buildPanelHeader("Milestones", onClose));

  const body = document.createElement("div");
  body.className = "ms-panel-body";
  body.appendChild(sectionLabel("Drag to reorder"));

  const sorted = [...data.milestones].sort((a, b) => a.order - b.order);
  let dragId: string | null = null;

  sorted.forEach((mile) => {
    body.appendChild(
      buildMilestoneRow(mile, data, onUpdate, {
        onDragStart: (id) => {
          dragId = id;
        },
        onDragEnd: () => {
          dragId = null;
        },
        onDrop: (targetId) => {
          if (!dragId || dragId === targetId) return;
          const from = data.milestones.find((m) => m.id === dragId);
          const to = data.milestones.find((m) => m.id === targetId);
          if (!from || !to) return;
          [from.order, to.order] = [to.order, from.order];
          onUpdate({ ...data });
        },
      }),
    );
  });

  body.appendChild(sectionLabel("Add milestone"));
  body.appendChild(buildAddMilestoneForm(data, onUpdate));
  panel.appendChild(body);
  return panel;
}

// --- Milestone Row ---

interface DragCallbacks {
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string) => void;
}

function buildMilestoneRow(
  mile: BoardMilestone,
  data: BoardData,
  onUpdate: (updated: BoardData) => void,
  dragCb: DragCallbacks,
): HTMLElement {
  const taskTotal = data.tasks.filter((t) => t.milestone === mile.name).length;
  const taskDone = data.tasks.filter(
    (t) => t.milestone === mile.name && t.col === "done",
  ).length;
  const pct = taskTotal ? Math.round((taskDone / taskTotal) * 100) : 0;
  const isOverdue =
    !!mile.dueDate && new Date(mile.dueDate) < new Date() && pct < 100;

  const row = document.createElement("div");
  row.className = "ms-item";
  row.draggable = true;
  row.dataset.id = mile.id;

  row.addEventListener("dragstart", () => {
    dragCb.onDragStart(mile.id);
    row.classList.add("ms-dragging");
  });
  row.addEventListener("dragend", () => {
    dragCb.onDragEnd();
    row.classList.remove("ms-dragging");
  });
  row.addEventListener("dragover", (e) => {
    e.preventDefault();
    row.classList.add("drag-over-item");
  });
  row.addEventListener("dragleave", () =>
    row.classList.remove("drag-over-item"),
  );
  row.addEventListener("drop", (e) => {
    e.preventDefault();
    row.classList.remove("drag-over-item");
    dragCb.onDrop(mile.id);
  });

  // Drag handle
  const handle = document.createElement("div");
  handle.className = "ms-drag-handle";
  handle.textContent = "\u283f";
  row.appendChild(handle);

  // Order badge (coloured)
  const badge = document.createElement("div");
  badge.className = "ms-mile-badge";
  badge.setCssProps({ "--ms-mile-bg": mile.color });
  badge.textContent = String(mile.order);
  row.appendChild(badge);

  // Info block
  const info = document.createElement("div");
  info.className = "ms-item-info";

  const nameEl = document.createElement("div");
  nameEl.className = "ms-item-name";
  nameEl.textContent = mile.label ? `${mile.name} — ${mile.label}` : mile.name;
  info.appendChild(nameEl);

  if (mile.dueDate) {
    const dueEl = document.createElement("div");
    dueEl.className = "ms-item-sub" + (isOverdue ? " ms-overdue" : "");
    const dateStr = new Date(mile.dueDate).toLocaleDateString();
    dueEl.textContent = `Due: ${dateStr}${isOverdue ? " \u26a0\ufe0f Overdue" : ""}`;
    info.appendChild(dueEl);
  }

  // Progress bar
  const progWrap = document.createElement("div");
  progWrap.className = "ms-progress";
  const progFill = document.createElement("div");
  progFill.className = "ms-progress-fill";
  progFill.setCssProps({
    "--ms-progress-width": `${pct}%`,
    "--ms-progress-bg": mile.color,
  });
  progWrap.appendChild(progFill);
  info.appendChild(progWrap);

  const progText = document.createElement("div");
  progText.className = "ms-progress-text";
  progText.textContent = `${taskDone}/${taskTotal} done (${pct}%)`;
  info.appendChild(progText);

  // Color picker (placed before info so popup opens rightward)
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = mile.color;
  colorInput.className = "ms-color-swatch";
  colorInput.title = "Change colour";
  colorInput.addEventListener("input", () => {
    // Live preview without saving
    mile.color = colorInput.value;
    badge.setCssProps({ "--ms-mile-bg": colorInput.value });
    progFill.setCssProps({
      "--ms-progress-width": `${pct}%`,
      "--ms-progress-bg": colorInput.value,
    });
  });
  colorInput.addEventListener("change", () => {
    // Save only when the picker is closed/committed
    onUpdate({ ...data });
  });
  row.appendChild(colorInput);

  row.appendChild(info);

  // Buttons
  const btns = document.createElement("div");
  btns.className = "ms-item-btns";

  const editBtn = document.createElement("button");
  editBtn.className = "ms-icon-btn";
  editBtn.textContent = "\u270f\ufe0f";
  editBtn.title = "Edit";
  editBtn.addEventListener("click", () => {
    openMilestoneEditModal(mile, data, onUpdate);
  });
  btns.appendChild(editBtn);

  const delBtn = document.createElement("button");
  delBtn.className = "ms-icon-btn del";
  delBtn.textContent = "\ud83d\uddd1";
  delBtn.title = "Delete";
  delBtn.addEventListener("click", () => {
    const remaining = data.milestones.filter((m) => m.id !== mile.id);
    remaining
      .sort((a, b) => a.order - b.order)
      .forEach((m, i) => {
        m.order = i + 1;
      });
    onUpdate({ ...data, milestones: remaining });
  });
  btns.appendChild(delBtn);

  row.appendChild(btns);
  return row;
}

// --- Add Milestone Form ---

function buildAddMilestoneForm(
  data: BoardData,
  onUpdate: (updated: BoardData) => void,
): HTMLElement {
  const form = document.createElement("div");
  form.className = "ms-add-form";

  const row1 = document.createElement("div");
  row1.className = "ms-row";
  const nameInput = document.createElement("input");
  nameInput.className = "ms-small-input";
  nameInput.placeholder = "Name  (e.g. M4)";
  const labelInput = document.createElement("input");
  labelInput.className = "ms-small-input";
  labelInput.placeholder = "Label  (e.g. Launch)";
  row1.appendChild(nameInput);
  row1.appendChild(labelInput);
  form.appendChild(row1);

  const row2 = document.createElement("div");
  row2.className = "ms-row";
  const colorPick = document.createElement("input");
  colorPick.type = "color";
  colorPick.value = randomColor();
  colorPick.className = "ms-color-swatch";
  const dueInput = document.createElement("input");
  dueInput.type = "date";
  dueInput.className = "ms-small-input";
  dueInput.title = "Due date (optional)";
  row2.appendChild(colorPick);
  row2.appendChild(dueInput);
  form.appendChild(row2);

  const addBtn = document.createElement("button");
  addBtn.className = "ms-btn ms-btn-primary ms-btn-full";
  addBtn.textContent = "+ add milestone";
  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    if (data.milestones.find((m) => m.name === name)) {
      new Notice("Milestone board: name already exists.");
      return;
    }
    const maxOrder = data.milestones.reduce(
      (max, m) => Math.max(max, m.order),
      0,
    );
    onUpdate({
      ...data,
      milestones: [
        ...data.milestones,
        {
          id: uid(),
          name,
          label: labelInput.value.trim(),
          color: colorPick.value,
          order: maxOrder + 1,
          dueDate: dueInput.value,
        },
      ],
    });
  });
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
  });
  form.appendChild(addBtn);
  return form;
}
