
import { uid } from "../utils/uid";
import { formGroup, trapEscape } from "../utils/dom";
import { TagInput } from "../components/TagInput";
import { BoardData, BoardTask } from "../src/types";

// ─── Task Modal ───────────────────────────────────────────────────────────────

export function openTaskModal(
  data: BoardData,
  onSave: (updated: BoardData) => void,
  defaultCol?: string,
  editId?: string,
): void {
  const task = editId ? data.tasks.find((t) => t.id === editId) : null;
  const tagInput = new TagInput(task?.tags ?? []);

  const overlay = document.createElement("div");
  overlay.className = "ms-overlay";

  const modal = document.createElement("div");
  modal.className = "ms-modal";

  // ── Header ──
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

  // ── Body ──
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

  const assignSel = document.createElement("select");
  assignSel.className = "ms-fs";
  const noAssign = document.createElement("option");
  noAssign.value = "";
  noAssign.textContent = "— None —";
  assignSel.appendChild(noAssign);
  data.users.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    if (u.name === task?.assignee) opt.selected = true;
    assignSel.appendChild(opt);
  });
  row2.appendChild(formGroup("Assignee", assignSel));

  const mileSel = document.createElement("select");
  mileSel.className = "ms-fs";
  const noMile = document.createElement("option");
  noMile.value = "";
  noMile.textContent = "— None —";
  mileSel.appendChild(noMile);
  [...data.milestones]
    .sort((a, b) => a.order - b.order)
    .forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.name;
      opt.textContent = `${m.name} — ${m.label || m.name}`;
      if (m.name === task?.milestone) opt.selected = true;
      mileSel.appendChild(opt);
    });
  row2.appendChild(formGroup("Milestone", mileSel));
  body.appendChild(row2);

  // Tags
  body.appendChild(formGroup("Tags  (press Enter to add)", tagInput.el));
  modal.appendChild(body);

  // ── Footer ──
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

    const payload = {
      title,
      desc: descInput.value.trim(),
      col: statusSel.value,
      priority: priSel.value as BoardTask["priority"],
      assignee: assignSel.value,
      milestone: mileSel.value,
      tags: tagInput.getValue(),
    };

    const updated = { ...data };

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
