import { Notice } from "obsidian";

import { uid } from "../utils/uid";
import { buildPanelHeader, sectionLabel, randomColor } from "../utils/dom";
import { BoardData, BoardTag } from "../src/types";

// Tags Panel

export function buildTagsPanel(
  data: BoardData,
  onUpdate: (updated: BoardData) => void,
  onClose: () => void,
): HTMLElement {
  const panel = document.createElement("div");
  panel.className = "ms-panel";
  panel.appendChild(buildPanelHeader("🏷 Tags", onClose));

  const body = document.createElement("div");
  body.className = "ms-panel-body";

  body.appendChild(sectionLabel("Current tags"));

  if (data.tags.length === 0) {
    const empty = document.createElement("div");
    empty.className = "ms-empty";
    empty.textContent = "No tags yet. Add one below.";
    body.appendChild(empty);
  } else {
    data.tags.forEach((tag) => {
      body.appendChild(buildTagRow(tag, data, onUpdate));
    });
  }

  body.appendChild(sectionLabel("Add tag"));
  body.appendChild(buildAddTagForm(data, onUpdate));

  panel.appendChild(body);
  return panel;
}

// Tag Row

function buildTagRow(
  tag: BoardTag,
  data: BoardData,
  onUpdate: (updated: BoardData) => void,
): HTMLElement {
  const taskCount = data.tasks.filter((t) => t.tags?.includes(tag.name)).length;

  const row = document.createElement("div");
  row.className = "ms-item";

  // Color picker (left side so popup opens rightward)
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = tag.color;
  colorInput.className = "ms-color-swatch";
  colorInput.title = "Change colour";
  colorInput.addEventListener("input", () => {
    // Live preview without saving
    tag.color = colorInput.value;
    pill.setCssProps({ "--ms-avatar-bg": colorInput.value });
  });
  colorInput.addEventListener("change", () => {
    // Save only when the picker is closed/committed
    onUpdate({ ...data });
  });
  row.appendChild(colorInput);

  // Tag pill preview
  const pill = document.createElement("div");
  pill.className = "ms-avatar ms-tag-preview";
  pill.setCssProps({ "--ms-avatar-bg": tag.color });
  pill.textContent = "#";
  row.appendChild(pill);

  // Info
  const info = document.createElement("div");
  info.className = "ms-item-info";
  const nameEl = document.createElement("div");
  nameEl.className = "ms-item-name";
  nameEl.textContent = `#${tag.name}`;
  const subEl = document.createElement("div");
  subEl.className = "ms-item-sub";
  subEl.textContent = `${taskCount} task${taskCount !== 1 ? "s" : ""}`;
  info.appendChild(nameEl);
  info.appendChild(subEl);
  row.appendChild(info);

  // Buttons
  const btns = document.createElement("div");
  btns.className = "ms-item-btns";

  const delBtn = document.createElement("button");
  delBtn.className = "ms-icon-btn del";
  delBtn.textContent = "🗑";
  delBtn.title = "Remove tag";
  delBtn.addEventListener("click", () => {
    onUpdate({ ...data, tags: data.tags.filter((t) => t.id !== tag.id) });
  });
  btns.appendChild(delBtn);

  row.appendChild(btns);
  return row;
}

// Add Tag Form

function buildAddTagForm(
  data: BoardData,
  onUpdate: (updated: BoardData) => void,
): HTMLElement {
  const form = document.createElement("div");
  form.className = "ms-add-form";

  const nameRow = document.createElement("div");
  nameRow.className = "ms-row";

  const colorPick = document.createElement("input");
  colorPick.type = "color";
  colorPick.value = randomColor();
  colorPick.className = "ms-color-swatch";
  colorPick.title = "Pick colour";
  nameRow.appendChild(colorPick);

  const nameInput = document.createElement("input");
  nameInput.className = "ms-small-input";
  nameInput.placeholder = "Tag name (e.g. bug)";
  nameRow.appendChild(nameInput);

  form.appendChild(nameRow);

  const addBtn = document.createElement("button");
  addBtn.className = "ms-btn ms-btn-primary ms-btn-full";
  addBtn.textContent = "＋ Add tag";
  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim().replace(/^#/, "").replace(/\s+/g, "-").toLowerCase();
    if (!name) { nameInput.focus(); return; }
    if (data.tags.find((t) => t.name === name)) {
      new Notice("Milestone board: tag already exists.");
      return;
    }
    const newTag: BoardTag = { id: uid(), name, color: colorPick.value };
    onUpdate({ ...data, tags: [...data.tags, newTag] });
  });

  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
  });

  form.appendChild(addBtn);
  return form;
}
