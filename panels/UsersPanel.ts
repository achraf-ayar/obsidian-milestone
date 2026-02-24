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
  panel.appendChild(buildPanelHeader("👥 Team Members", onClose));

  const body = document.createElement("div");
  body.className = "ms-panel-body";

  // Section: existing members
  body.appendChild(sectionLabel("Current Members"));
  data.users.forEach((user) => {
    body.appendChild(buildUserRow(user, data, onUpdate));
  });

  // Section: add member
  body.appendChild(sectionLabel("Add Member"));
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
  const taskCount = data.tasks.filter((t) => t.assignee === user.name).length;

  const row = document.createElement("div");
  row.className = "ms-item";

  // Avatar
  const avatar = document.createElement("div");
  avatar.className = "ms-avatar";
  avatar.style.background = user.color;
  avatar.textContent = user.initials || user.name.slice(1, 3).toUpperCase();
  row.appendChild(avatar);

  // Info
  const info = document.createElement("div");
  info.className = "ms-item-info";
  info.innerHTML = `
		<div class="ms-item-name">${user.name}</div>
		<div class="ms-item-sub">${taskCount} task${taskCount !== 1 ? "s" : ""} assigned</div>
	`;
  // Colour picker (placed before info so popup opens rightward)
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = user.color;
  colorInput.className = "ms-color-swatch";
  colorInput.title = "Change colour";
  colorInput.addEventListener("input", () => {
    user.color = colorInput.value;
    avatar.style.background = colorInput.value;
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
  addBtn.className = "ms-btn ms-btn-primary";
  addBtn.style.width = "100%";
  addBtn.textContent = "＋ Add Member";
  addBtn.addEventListener("click", () => {
    let name = nameInput.value.trim();
    if (!name) return;
    if (!name.startsWith("@")) name = "@" + name;
    if (data.users.find((u) => u.name === name)) {
      new Notice("Milestone Board: User already exists.");
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

