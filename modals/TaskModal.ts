
import { Notice } from "obsidian";

import { uid } from "../utils/uid";
import { formGroup, trapEscape, randomColor } from "../utils/dom";
import { BoardData, BoardTask, BoardUser, BoardMilestone, BoardTag } from "../src/types";

// Task Modal

export function openTaskModal(
  data: BoardData,
  onSave: (updated: BoardData) => void,
  defaultCol?: string,
  editId?: string,
): void {
  const task = editId ? data.tasks.find((t) => t.id === editId) : null;

  const overlay = document.createElement("div");
  overlay.className = "ms-overlay";

  const modal = document.createElement("div");
  modal.className = "ms-modal";

  // Header
  const hd = document.createElement("div");
  hd.className = "ms-modal-hd";

  const titleEl = document.createElement("div");
  titleEl.className = "ms-modal-title";
  titleEl.textContent = task ? "Edit Task" : "New Task";

  const closeBtn = document.createElement("button");
  closeBtn.className = "ms-btn ms-btn-ghost";
  closeBtn.style.padding = "4px 10px";
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", () => overlay.remove());

  hd.appendChild(titleEl);
  hd.appendChild(closeBtn);
  modal.appendChild(hd);

  // Body
  const body = document.createElement("div");
  body.className = "ms-modal-body";

  // Title field
  const titleInput = document.createElement("input");
  titleInput.className = "ms-fi";
  titleInput.placeholder = "Task title…";
  titleInput.value = task?.title ?? "";
  body.appendChild(formGroup("Title *", titleInput));

  // Description field
  const descInput = document.createElement("textarea");
  descInput.className = "ms-ft";
  descInput.placeholder = "Optional notes…";
  descInput.value = task?.desc ?? "";
  body.appendChild(formGroup("Description", descInput));

  // Status + Priority row
  const row1 = document.createElement("div");
  row1.className = "ms-2col";

  const statusSel = document.createElement("select");
  statusSel.className = "ms-fs";
  data.columns.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.label;
    if (c.id === (task?.col ?? defaultCol ?? "todo")) opt.selected = true;
    statusSel.appendChild(opt);
  });
  row1.appendChild(formGroup("Status", statusSel));

  const priSel = document.createElement("select");
  priSel.className = "ms-fs";
  (
    [
      ["high", "🔴 High"],
      ["medium", "🟡 Medium"],
      ["low", "🟢 Low"],
    ] as const
  ).forEach(([v, l]) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = l;
    if (v === (task?.priority ?? "medium")) opt.selected = true;
    priSel.appendChild(opt);
  });
  row1.appendChild(formGroup("Priority", priSel));
  body.appendChild(row1);

  // Assignee + Milestone row
  const row2 = document.createElement("div");
  row2.className = "ms-2col";

  const assignInput = document.createElement("input");
  assignInput.className = "ms-fi";
  assignInput.placeholder = "Enter username (e.g., @john)";
  assignInput.value = task?.assignee ?? "";
  
  const assignInputWrapper = document.createElement("div");
  assignInputWrapper.appendChild(assignInput);
  
  if (data.users.length > 0) {
    const datalistId = "user-datalist-" + uid();
    const datalist = document.createElement("datalist");
    datalist.id = datalistId;
    data.users.forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.name;
      datalist.appendChild(opt);
    });
    assignInput.setAttribute("list", datalistId);
    assignInputWrapper.appendChild(datalist);
  }
  
  row2.appendChild(formGroup("Assignee", assignInputWrapper));

  const mileInput = document.createElement("input");
  mileInput.className = "ms-fi";
  mileInput.placeholder = "Enter milestone (e.g., M4)";
  mileInput.value = task?.milestone ?? "";
  
  const mileInputWrapper = document.createElement("div");
  mileInputWrapper.appendChild(mileInput);
  
  if (data.milestones.length > 0) {
    const datalistId = "milestone-datalist-" + uid();
    const datalist = document.createElement("datalist");
    datalist.id = datalistId;
    data.milestones.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.name;
      opt.label = m.label || m.name;
      datalist.appendChild(opt);
    });
    mileInput.setAttribute("list", datalistId);
    mileInputWrapper.appendChild(datalist);
  }
  
  row2.appendChild(formGroup("Milestone", mileInputWrapper));
  body.appendChild(row2);

  // Tags
  const tagsInput = document.createElement("input");
  tagsInput.className = "ms-fi";
  tagsInput.placeholder = "e.g. frontend, bug, urgent";
  tagsInput.value = (task?.tags ?? []).join(", ");

  const tagsInputWrapper = document.createElement("div");
  tagsInputWrapper.appendChild(tagsInput);

  // Autocomplete from saved tags + tags already used in tasks
  const allTags = new Set<string>([
    ...data.tags.map((t) => t.name),
    ...data.tasks.flatMap((t) => t.tags ?? []),
  ]);
  if (allTags.size > 0) {
    const datalistId = "tags-datalist-" + uid();
    const datalist = document.createElement("datalist");
    datalist.id = datalistId;
    allTags.forEach((tag) => {
      const opt = document.createElement("option");
      opt.value = tag;
      datalist.appendChild(opt);
    });
    tagsInput.setAttribute("list", datalistId);
    tagsInputWrapper.appendChild(datalist);
  }

  body.appendChild(formGroup("Tags (comma separated)", tagsInputWrapper));
  modal.appendChild(body);

  // Footer
  const ft = document.createElement("div");
  ft.className = "ms-modal-ft";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "ms-btn ms-btn-ghost";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => overlay.remove());

  const saveBtn = document.createElement("button");
  saveBtn.className = "ms-btn ms-btn-primary";
  saveBtn.textContent = "Save Task";
  saveBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.style.borderColor = "#ef4444";
      titleInput.focus();
      return;
    }

    const updated = { ...data };
    
    // Handle assignee - create user if new
    let assigneeValue = assignInput.value.trim();
    if (assigneeValue) {
      if (!assigneeValue.startsWith("@")) assigneeValue = "@" + assigneeValue;
      if (!data.users.find((u) => u.name === assigneeValue)) {
        const newUser: BoardUser = {
          id: uid(),
          name: assigneeValue,
          color: randomColor(),
          initials: assigneeValue.slice(1, 3).toUpperCase(),
        };
        updated.users = [...data.users, newUser];
      }
    }
    
    // Handle milestone - create if new
    let milestoneValue = mileInput.value.trim();
    if (milestoneValue) {
      if (!data.milestones.find((m) => m.name === milestoneValue)) {
        const maxOrder = data.milestones.reduce((max, m) => Math.max(max, m.order), 0);
        const newMilestone: BoardMilestone = {
          id: uid(),
          name: milestoneValue,
          label: milestoneValue,
          color: randomColor(),
          order: maxOrder + 1,
          dueDate: "",
        };
        updated.milestones = [...data.milestones, newMilestone];
      }
    }

    const parsedTags = tagsInput.value
      .split(",")
      .map((t) => t.trim().replace(/^#/, "").replace(/\s+/g, "-").toLowerCase())
      .filter(Boolean);

    // Auto-create any new tags not yet in data.tags
    const existingTagNames = new Set((updated.tags ?? []).map((t: BoardTag) => t.name));
    const newTags: BoardTag[] = parsedTags
      .filter((name) => !existingTagNames.has(name))
      .map((name) => ({ id: uid(), name, color: randomColor() }));
    if (newTags.length > 0) {
      updated.tags = [...(updated.tags ?? []), ...newTags];
    }

    const payload = {
      title,
      desc: descInput.value.trim(),
      col: statusSel.value,
      priority: priSel.value as BoardTask["priority"],
      assignee: assigneeValue,
      milestone: milestoneValue,
      tags: parsedTags,
    };

    if (task) {
      updated.tasks = data.tasks.map((t) =>
        t.id === task.id ? { ...t, ...payload } : t,
      );
    } else {
      updated.tasks = [
        ...data.tasks,
        { id: uid(), createdAt: Date.now(), ...payload },
      ];
    }

    overlay.remove();
    onSave(updated);
  });

  ft.appendChild(cancelBtn);
  ft.appendChild(saveBtn);
  modal.appendChild(ft);

  overlay.appendChild(modal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
  trapEscape(overlay);
  setTimeout(() => titleInput.focus(), 80);
}
