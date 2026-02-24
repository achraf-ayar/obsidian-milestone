// DOM Helpers

/** Create an element with optional class and text content. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Build a labeled form group containing a child element. */
export function formGroup(label: string, child: HTMLElement): HTMLElement {
  const group = el("div", "ms-fg");
  const lbl = el("label", "ms-fl", label);
  group.appendChild(lbl);
  group.appendChild(child);
  return group;
}

/** Attach a self-cleaning Escape key listener to close an overlay. */
export function trapEscape(overlay: HTMLElement): void {
  const handler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", handler);
    }
  };
  document.addEventListener("keydown", handler);
}

/** Build a panel header with title and close button. */
export function buildPanelHeader(title: string, onClose: () => void): HTMLElement {
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

/** Build a section label. */
export function sectionLabel(text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "ms-section-label";
  el.textContent = text;
  return el;
}

/** Generate a random hex color. */
export function randomColor(): string {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
}
