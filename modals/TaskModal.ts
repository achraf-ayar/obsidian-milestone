
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
  titleEl.textContent = task ? "Edit task" : "New task";

  const closeBtn = document.createElement("button");
  closeBtn.className = "ms-btn ms-btn-ghost ms-btn-close";
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

  // Assignee — pill input (multi-user)
  const activeAssignees: string[] = [...(task?.assignees ?? [])];

  const assignWrap = document.createElement("div");
  assignWrap.className = "ms-tag-wrap";

  const assignBareInput = document.createElement("input");
  assignBareInput.className = "ms-bare";
  assignBareInput.placeholder = activeAssignees.length === 0 ? "Add assignees…" : "";

  const assignDatalistId = "user-datalist-" + uid();
  const assignDatalist = document.createElement("datalist");
  assignDatalist.id = assignDatalistId;
  data.users.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.name;
    assignDatalist.appendChild(opt);
  });
  assignBareInput.setAttribute("list", assignDatalistId);
  assignWrap.appendChild(assignDatalist);

  function getUserColor(name: string): string {
    return data.users.find((u) => u.name === name)?.color ?? "#5eead4";
  }

  function renderAssigneePills(): void {
    assignWrap.querySelectorAll(".ms-tag-pill").forEach((p) => p.remove());
    activeAssignees.forEach((name) => {
      const color = getUserColor(name);
      const pill = document.createElement("span");
      pill.className = "ms-tag-pill";
      pill.setCssProps({
        "--ms-pill-bg": `color-mix(in srgb, ${color} 18%, transparent)`,
        "--ms-pill-color": color,
        "--ms-pill-border": `color-mix(in srgb, ${color} 35%, transparent)`,
      });
      const label = document.createElement("span");
      label.textContent = name;
      const rm = document.createElement("span");
      rm.className = "ms-tag-rm";
      rm.textContent = "×";
      rm.addEventListener("click", () => {
        activeAssignees.splice(activeAssignees.indexOf(name), 1);
        renderAssigneePills();
      });
      pill.appendChild(label);
      pill.appendChild(rm);
      assignWrap.insertBefore(pill, assignBareInput);
    });
    assignBareInput.placeholder = activeAssignees.length === 0 ? "Add assignees…" : "";
  }

  function commitAssignee(raw: string): void {
    let name = raw.trim();
    if (!name) return;
    if (!name.startsWith("@")) name = "@" + name;
    if (!activeAssignees.includes(name)) {
      activeAssignees.push(name);
      renderAssigneePills();
    }
    assignBareInput.value = "";
  }

  assignBareInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (assignBareInput.value.trim()) { e.preventDefault(); commitAssignee(assignBareInput.value); }
    } else if (e.key === "Backspace" && assignBareInput.value === "" && activeAssignees.length > 0) {
      activeAssignees.pop();
      renderAssigneePills();
    }
  });
  assignBareInput.addEventListener("blur", () => { if (assignBareInput.value.trim()) commitAssignee(assignBareInput.value); });
  assignWrap.addEventListener("click", () => assignBareInput.focus());
  assignWrap.appendChild(assignBareInput);
  renderAssigneePills();

  row2.appendChild(formGroup("Assignees", assignWrap));

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

  // Tags — pill input
  const activeTags: string[] = [...(task?.tags ?? [])];

  const allTagNames = new Set<string>([
    ...data.tags.map((t) => t.name),
    ...data.tasks.flatMap((t) => t.tags ?? []),
  ]);

  const tagWrap = document.createElement("div");
  tagWrap.className = "ms-tag-wrap";

  const bareInput = document.createElement("input");
  bareInput.className = "ms-bare";
  bareInput.placeholder = activeTags.length === 0 ? "Add tags…" : "";

  // Datalist autocomplete
  const datalistId = "tags-datalist-" + uid();
  const datalist = document.createElement("datalist");
  datalist.id = datalistId;
  allTagNames.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    datalist.appendChild(opt);
  });
  bareInput.setAttribute("list", datalistId);
  tagWrap.appendChild(datalist);

  function getTagColor(name: string): string {
    const found = data.tags.find((t) => t.name === name);
    return found?.color ?? "#a855f7";
  }

  function renderPills(): void {
    // Remove all pill elements (keep input + datalist)
    tagWrap.querySelectorAll(".ms-tag-pill").forEach((p) => p.remove());
    activeTags.forEach((name) => {
      const color = getTagColor(name);
      const pill = document.createElement("span");
      pill.className = "ms-tag-pill";
      pill.setCssProps({
        "--ms-pill-bg": `color-mix(in srgb, ${color} 18%, transparent)`,
        "--ms-pill-color": color,
        "--ms-pill-border": `color-mix(in srgb, ${color} 35%, transparent)`,
      });
      const label = document.createElement("span");
      label.textContent = "#" + name;
      const rm = document.createElement("span");
      rm.className = "ms-tag-rm";
      rm.textContent = "×";
      rm.addEventListener("click", () => {
        activeTags.splice(activeTags.indexOf(name), 1);
        renderPills();
      });
      pill.appendChild(label);
      pill.appendChild(rm);
      tagWrap.insertBefore(pill, bareInput);
    });
    bareInput.placeholder = activeTags.length === 0 ? "Add tags…" : "";
  }

  function commitTag(raw: string): void {
    const name = raw.trim().replace(/^#/, "").replace(/\s+/g, "-").toLowerCase();
    if (name && !activeTags.includes(name)) {
      activeTags.push(name);
      renderPills();
    }
    bareInput.value = "";
  }

  bareInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (bareInput.value.trim()) {
        e.preventDefault();
        commitTag(bareInput.value);
      }
    } else if (e.key === "Backspace" && bareInput.value === "" && activeTags.length > 0) {
      activeTags.pop();
      renderPills();
    }
  });

  bareInput.addEventListener("blur", () => {
    if (bareInput.value.trim()) commitTag(bareInput.value);
  });

  // Clicking anywhere in the wrap focuses the input
  tagWrap.addEventListener("click", () => bareInput.focus());
  tagWrap.appendChild(bareInput);

  renderPills();

  body.appendChild(formGroup("Tags", tagWrap));
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
  saveBtn.textContent = "Save task";
  saveBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.classList.add("ms-error");
      titleInput.focus();
      return;
    }

    const updated = { ...data };

    // Commit any unconfirmed assignee text
    if (assignBareInput.value.trim()) commitAssignee(assignBareInput.value);

    // Auto-create any new users not yet in data.users
    const existingUserNames = new Set((updated.users ?? []).map((u: BoardUser) => u.name));
    const newUsers: BoardUser[] = activeAssignees
      .filter((name) => !existingUserNames.has(name))
      .map((name) => ({
        id: uid(),
        name,
        color: randomColor(),
        initials: name.replace(/^@/, "").slice(0, 2).toUpperCase(),
      }));
    if (newUsers.length > 0) {
      updated.users = [...(updated.users ?? []), ...newUsers];
    }
    
    // Handle milestone - create if new
    const milestoneValue = mileInput.value.trim();
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

    // Commit any unconfirmed text still in the bare input
    if (bareInput.value.trim()) commitTag(bareInput.value);

    // Auto-create any new tags not yet in data.tags
    const existingTagNames = new Set((updated.tags ?? []).map((t: BoardTag) => t.name));
    const newTags: BoardTag[] = activeTags
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
      assignees: [...activeAssignees],
      milestone: milestoneValue,
      tags: [...activeTags],
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
