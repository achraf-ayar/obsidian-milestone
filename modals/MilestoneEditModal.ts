
import { BoardData, BoardMilestone } from "../src/types";
import { formGroup, trapEscape } from "../utils/dom";

// Milestone Edit Modal

export function openMilestoneEditModal(
  milestone: BoardMilestone,
  data: BoardData,
  onSave: (updated: BoardData) => void,
): void {
  const overlay = document.createElement("div");
  overlay.className = "ms-overlay";

  const modal = document.createElement("div");
  modal.className = "ms-modal";
  modal.style.width = "360px";

  // ── Header ──
  const hd = document.createElement("div");
  hd.className = "ms-modal-hd";

  const titleEl = document.createElement("div");
  titleEl.className = "ms-modal-title";
  titleEl.textContent = "Edit Milestone";

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

  const nameIn = document.createElement("input");
  nameIn.className = "ms-fi";
  nameIn.value = milestone.name;

  const labelIn = document.createElement("input");
  labelIn.className = "ms-fi";
  labelIn.value = milestone.label ?? "";

  const dueIn = document.createElement("input");
  dueIn.type = "date";
  dueIn.className = "ms-fi";
  dueIn.value = milestone.dueDate ?? "";

  const colorIn = document.createElement("input");
  colorIn.type = "color";
  colorIn.className = "ms-fi";
  colorIn.value = milestone.color;
  colorIn.style.height = "40px";

  body.appendChild(formGroup("Name", nameIn));
  body.appendChild(formGroup("Label", labelIn));
  body.appendChild(formGroup("Due Date", dueIn));
  body.appendChild(formGroup("Color", colorIn));
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
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () => {
    if (!nameIn.value.trim()) return;

    const updated: BoardData = {
      ...data,
      milestones: data.milestones.map((m) =>
        m.id === milestone.id
          ? {
              ...m,
              name: nameIn.value.trim(),
              label: labelIn.value.trim(),
              dueDate: dueIn.value,
              color: colorIn.value,
            }
          : m,
      ),
    };

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
}
