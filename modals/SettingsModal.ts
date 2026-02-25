import { trapEscape } from "../utils/dom";
import type MilestoneBoardPlugin from "../src/main";
import type { BoardData } from "../src/types";

// Settings Modal

export function openSettingsModal(
  plugin: MilestoneBoardPlugin,
  data: BoardData,
  onSave: (filters: {
    search: string;
    assignee: string;
    milestone: string;
    priority: string;
    tag: string;
  }) => void,
): void {
  const df = plugin.settings.defaultFilters ?? {
    search: "", assignee: "", milestone: "", priority: "", tag: "",
  };

  const overlay = document.createElement("div");
  overlay.className = "ms-overlay";

  const modal = document.createElement("div");
  modal.className = "ms-modal";
  modal.style.width = "520px";

  // Header
  const hd = document.createElement("div");
  hd.className = "ms-modal-hd";

  const titleEl = document.createElement("div");
  titleEl.className = "ms-modal-title";
  titleEl.textContent = "⚙ Board Settings";

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

  // ── Section: Default Filters ──────────────────────────────
  const filtersSection = document.createElement("div");
  filtersSection.className = "ms-modal-section";

  const filtersSectionTitle = document.createElement("div");
  filtersSectionTitle.className = "ms-modal-section-title";
  filtersSectionTitle.textContent = "Default Filters";
  filtersSection.appendChild(filtersSectionTitle);

  // Search
  const searchInput = document.createElement("input");
  searchInput.className = "ms-fi";
  searchInput.placeholder = "e.g. auth, bug, v2…";
  searchInput.value = df.search;
  filtersSection.appendChild(mkGroup("Default Search", searchInput));

  // 2-col row: Assignee + Milestone
  const row1 = document.createElement("div");
  row1.className = "ms-2col";

  const assignSel = mkSelect(
    "👤 Any assignee",
    data.users.map((u) => ({ value: u.name, label: u.name })),
    df.assignee,
  );
  assignSel.style.width = "100%";
  row1.appendChild(mkGroup("Default Assignee", assignSel));

  const mileSel = mkSelect(
    "🏁 Any milestone",
    [...data.milestones]
      .sort((a, b) => a.order - b.order)
      .map((m) => ({ value: m.name, label: m.name })),
    df.milestone,
  );
  mileSel.style.width = "100%";
  row1.appendChild(mkGroup("Default Milestone", mileSel));
  filtersSection.appendChild(row1);

  // 2-col row: Priority + Tag
  const row2 = document.createElement("div");
  row2.className = "ms-2col";

  const priSel = mkSelect(
    "⚡ Any priority",
    [
      { value: "high", label: "🔴 High" },
      { value: "medium", label: "🟡 Medium" },
      { value: "low", label: "🟢 Low" },
    ],
    df.priority,
  );
  priSel.style.width = "100%";
  row2.appendChild(mkGroup("Default Priority", priSel));

  const tagSel = mkSelect(
    "🏷 Any tag",
    data.tags.map((t) => ({ value: t.name, label: `#${t.name}` })),
    df.tag,
  );
  tagSel.style.width = "100%";
  row2.appendChild(mkGroup("Default Tag", tagSel));
  filtersSection.appendChild(row2);

  body.appendChild(filtersSection);

  // Divider
  body.appendChild(mkDivider());

  // ── Section: Data ─────────────────────────────────────────
  const dataSection = document.createElement("div");
  dataSection.className = "ms-modal-section";

  const dataSectionTitle = document.createElement("div");
  dataSectionTitle.className = "ms-modal-section-title";
  dataSectionTitle.textContent = "Data";
  dataSection.appendChild(dataSectionTitle);

  const fileInput = document.createElement("input");
  fileInput.className = "ms-fi";
  fileInput.placeholder = "milestone-board.json";
  fileInput.value = plugin.settings.dataFile ?? "milestone-board.json";
  dataSection.appendChild(mkGroup("Data file path", fileInput));

  body.appendChild(dataSection);
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
  saveBtn.textContent = "💾 Save Settings";
  saveBtn.addEventListener("click", async () => {
    const newFilters = {
      search: searchInput.value.trim(),
      assignee: assignSel.value,
      milestone: mileSel.value,
      priority: priSel.value,
      tag: tagSel.value,
    };
    const newDataFile = fileInput.value.trim() || "milestone-board.json";

    plugin.settings.defaultFilters = newFilters;
    plugin.settings.dataFile = newDataFile;
    await plugin.saveSettings();

    overlay.remove();
    onSave(newFilters);
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
  setTimeout(() => searchInput.focus(), 80);
}

// Helpers

function mkGroup(label: string, el: HTMLElement): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "ms-fg";
  const lbl = document.createElement("div");
  lbl.className = "ms-fl";
  lbl.textContent = label;
  wrap.appendChild(lbl);
  wrap.appendChild(el);
  return wrap;
}

function mkSelect(
  placeholder: string,
  options: { value: string; label: string }[],
  current: string,
): HTMLSelectElement {
  const sel = document.createElement("select");
  sel.className = "ms-fs";

  const def = document.createElement("option");
  def.value = "";
  def.textContent = placeholder;
  sel.appendChild(def);

  options.forEach(({ value, label }) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    if (value === current) opt.selected = true;
    sel.appendChild(opt);
  });

  return sel;
}

function mkDivider(): HTMLElement {
  const d = document.createElement("div");
  d.style.cssText =
    "height:1px;background:var(--background-modifier-border);margin:2px 0;";
  return d;
}
