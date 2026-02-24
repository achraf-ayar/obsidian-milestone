import { Notice } from "obsidian";

import { uid } from "../utils/uid";
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
  row.appendChild(info);

  // Buttons
  const btns = document.createElement("div");
  btns.className = "ms-item-btns";

  // Colour picker
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
  btns.appendChild(colorInput);

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

  const nameInput = document.createElement("input");
  nameInput.className = "ms-small-input";
  nameInput.placeholder = "Username  (e.g. @john)";
  nameRow.appendChild(nameInput);

  const colorPick = document.createElement("input");
  colorPick.type = "color";
  colorPick.value = randomColor();
  colorPick.className = "ms-color-swatch";
  colorPick.title = "Pick colour";
  nameRow.appendChild(colorPick);
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

// Helpers

function buildPanelHeader(title: string, onClose: () => void): HTMLElement {
  const header = document.createElement("div");
  header.className = "ms-panel-header";

  const titleEl = document.createElement("div");
  titleEl.className = "ms-panel-title";
  titleEl.textContent = title;

  const closeBtn = document.createElement("button");
  closeBtn.className = "ms-btn ms-btn-ghost";
  closeBtn.style.padding = "4px 10px";
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", onClose);

  header.appendChild(titleEl);
  header.appendChild(closeBtn);
  return header;
}

function sectionLabel(text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "ms-section-label";
  el.textContent = text;
  return el;
}

function randomColor(): string {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
  );
}
