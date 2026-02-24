// ─── DOM Helpers ──────────────────────────────────────────────────────────────

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

/** Build a <select> element from an option list. */
export function buildSelect(
  options: { value: string; label: string }[],
  currentValue: string,
  className = "ms-fs",
): HTMLSelectElement {
  const sel = el("select", className) as HTMLSelectElement;
  options.forEach(({ value, label }) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    if (value === currentValue) opt.selected = true;
    sel.appendChild(opt);
  });
  return sel;
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
