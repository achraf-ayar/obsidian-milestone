import { Notice } from "obsidian";

import { uid } from "../utils/uid";
import { buildPanelHeader, sectionLabel, randomColor } from "../utils/dom";
import { BoardData, BoardUser } from "../src/types";

// Users Panel

export function buildUsersPanel(
  data: BoardData,
  onUpdate: (updated: BoardData) => void,
  onClose: () => void,
): HTMLElement {
  const panel = document.createElement("div");
  panel.className = "ms-panel";

  // Header
  panel.appendChild(buildPanelHeader("👥 Team members", onClose));

  const body = document.createElement("div");
  body.className = "ms-panel-body";

  // Section: existing members
  body.appendChild(sectionLabel("Current members"));
  data.users.forEach((user) => {
    body.appendChild(buildUserRow(user, data, onUpdate));
  });

  // Section: add member
  body.appendChild(sectionLabel("Add member"));
  body.appendChild(buildAddUserForm(data, onUpdate));

  panel.appendChild(body);
  return panel;
}

// User Row

function buildUserRow(
  user: BoardUser,
  data: BoardData,
  onUpdate: (updated: BoardData) => void,
): HTMLElement {
  const taskCount = data.tasks.filter((t) => (t.assignees ?? []).includes(user.name)).length;

  const row = document.createElement("div");
  row.className = "ms-item";

  // Avatar
  const avatar = document.createElement("div");
  avatar.className = "ms-avatar";
  avatar.setCssProps({ "--ms-avatar-bg": user.color });
  avatar.textContent = user.initials || user.name.slice(1, 3).toUpperCase();
  row.appendChild(avatar);

  // Info
  const info = document.createElement("div");
  info.className = "ms-item-info";

  const nameEl = document.createElement("div");
  nameEl.className = "ms-item-name";
  nameEl.textContent = user.name;
  info.appendChild(nameEl);

  const subEl = document.createElement("div");
  subEl.className = "ms-item-sub";
  subEl.textContent = `${taskCount} task${taskCount !== 1 ? "s" : ""} assigned`;
  info.appendChild(subEl);

  // Colour picker (placed before info so popup opens rightward)
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = user.color;
  colorInput.className = "ms-color-swatch";
  colorInput.title = "Change colour";
  colorInput.addEventListener("input", () => {
    // Live preview without saving
    user.color = colorInput.value;
    avatar.setCssProps({ "--ms-avatar-bg": colorInput.value });
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

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.className = "ms-icon-btn del";
  delBtn.textContent = "🗑";
  delBtn.title = "Remove member";
  delBtn.addEventListener("click", () => {
    onUpdate({ ...data, users: data.users.filter((u) => u.id !== user.id) });
  });
  btns.appendChild(delBtn);

  row.appendChild(btns);
  return row;
}

// Add User Form

function buildAddUserForm(
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
  nameInput.placeholder = "Username  (e.g. @john)";
  nameRow.appendChild(nameInput);
  form.appendChild(nameRow);

  const addBtn = document.createElement("button");
  addBtn.className = "ms-btn ms-btn-primary ms-btn-full";
  addBtn.textContent = "＋ add member";
  addBtn.addEventListener("click", () => {
    let name = nameInput.value.trim();
    if (!name) return;
    if (!name.startsWith("@")) name = "@" + name;
    if (data.users.find((u) => u.name === name)) {
      new Notice("Milestone board: user already exists.");
      return;
    }
    const newUser: BoardUser = {
      id: uid(),
      name,
      color: colorPick.value,
      initials: name.slice(1, 3).toUpperCase(),
    };
    onUpdate({ ...data, users: [...data.users, newUser] });
  });
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
  });
  form.appendChild(addBtn);

  return form;
}
