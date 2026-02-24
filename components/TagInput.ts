// ─── Tag Input Component ──────────────────────────────────────────────────────

export class TagInput {
  private tags: string[];
  readonly el: HTMLElement;
  private bareInput: HTMLInputElement;

  constructor(initialTags: string[] = []) {
    this.tags = [...initialTags];
    this.el = document.createElement("div");
    this.el.className = "ms-tag-wrap";
    this.el.addEventListener("click", () => this.bareInput.focus());

    this.bareInput = document.createElement("input");
    this.bareInput.className = "ms-bare";
    this.bareInput.placeholder = "Add tag…";
    this.bareInput.addEventListener("keydown", (e) => this.onKey(e));

    this.render();
  }

  private onKey(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = this.bareInput.value
        .trim()
        .replace(/^#/, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
      if (val && !this.tags.includes(val)) {
        this.tags.push(val);
        this.render();
      } else {
        this.bareInput.value = "";
      }
    } else if (
      e.key === "Backspace" &&
      !this.bareInput.value &&
      this.tags.length > 0
    ) {
      this.tags.pop();
      this.render();
    }
  }

  private removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
    this.render();
  }

  private render(): void {
    this.el.innerHTML = "";

    this.tags.forEach((tag) => {
      const pill = document.createElement("span");
      pill.className = "ms-tag-pill";

      const label = document.createTextNode(`#${tag} `);
      pill.appendChild(label);

      const rm = document.createElement("span");
      rm.className = "ms-tag-rm";
      rm.textContent = "×";
      rm.addEventListener("click", () => this.removeTag(tag));
      pill.appendChild(rm);

      this.el.appendChild(pill);
    });

    this.bareInput.value = "";
    this.bareInput.placeholder = this.tags.length ? "" : "Add tag…";
    this.el.appendChild(this.bareInput);
  }

  getValue(): string[] {
    return [...this.tags];
  }
}
