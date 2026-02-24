import { ItemView, WorkspaceLeaf } from "obsidian";
import type { BoardData, BoardFilters, ActivePanel } from "./types";
import { VIEW_TYPE } from "./constants";
import { STYLES } from "./styles";
import type MilestoneBoardPlugin from "./main";
import { buildColumn } from "../components/Column";
import { openTaskModal } from "../modals/TaskModal";
import { buildMilestonesPanel } from "../panels/MilestonePanel";
import { buildUsersPanel } from "../panels/UsersPanel";
import { DataStore } from "../utils/dataStore";
import { uniqueTagsFromTasks, matchesFilter } from "../utils/filters";

// Board View: renders the topbar, stats bar, board columns, and panels

export class BoardView extends ItemView {
  private plugin: MilestoneBoardPlugin;
  private store: DataStore;
  private data: BoardData;
  private filters: BoardFilters;
  private activePanel: ActivePanel;
  private dragId: string | null;

  constructor(leaf: WorkspaceLeaf, plugin: MilestoneBoardPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.store = new DataStore(this.app, plugin.settings.dataFile);
    this.data = { tasks: [], columns: [], users: [], milestones: [] };
    this.filters = {
      search: "",
      assignee: "",
      milestone: "",
      priority: "",
      tag: "",
    };
    this.activePanel = null;
    this.dragId = null;
  }

  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Milestone Board";
  }
  getIcon() {
    return "layout-dashboard";
  }

  async onOpen() {
    await this.reload();
  }
  async onClose() {
    /* nothing to clean up */
  }

  // Data

  private async reload(): Promise<void> {
    this.data = await this.store.load();
    this.render();
  }

  private async save(updated: BoardData): Promise<void> {
    this.data = updated;
    await this.store.save(updated);
    this.render();
  }

  // Render

  private render(): void {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("ms-root");
    root.style.cssText =
      "display:flex;flex-direction:column;height:100%;overflow:hidden;";

    // Inject styles once
    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    root.appendChild(styleEl);

    root.appendChild(this.buildTopbar());
    root.appendChild(this.buildStatsbar());

    const body = document.createElement("div");
    body.style.cssText = "display:flex;flex:1;overflow:hidden;";
    body.appendChild(this.buildBoard());

    if (this.activePanel === "users") {
      body.appendChild(
        buildUsersPanel(
          this.data,
          (d) => this.save(d),
          () => {
            this.activePanel = null;
            this.render();
          },
        ),
      );
    } else if (this.activePanel === "milestones") {
      body.appendChild(
        buildMilestonesPanel(
          this.data,
          (d) => this.save(d),
          () => {
            this.activePanel = null;
            this.render();
          },
        ),
      );
    }

    root.appendChild(body);
  }

  // Topbar

  private buildTopbar(): HTMLElement {
    const bar = document.createElement("div");
    bar.className = "ms-topbar";

    // Logo
    const logo = document.createElement("div");
    logo.className = "ms-logo";
    logo.textContent = "◈ Milestone";
    bar.appendChild(logo);

    // Filters
    const filtersWrap = document.createElement("div");
    filtersWrap.className = "ms-filters";

    const searchInput = document.createElement("input");
    searchInput.className = "ms-input";
    searchInput.placeholder = "🔍 Search…";
    searchInput.value = this.filters.search;
    searchInput.addEventListener("input", () => {
      this.filters.search = searchInput.value;
      this.applyFilters();
    });
    filtersWrap.appendChild(searchInput);

    const userNames = this.data.users.map((u) => u.name);
    const mileNames = [...this.data.milestones]
      .sort((a, b) => a.order - b.order)
      .map((m) => m.name);
    const allTags = uniqueTagsFromTasks(this.data.tasks);

    filtersWrap.appendChild(
      this.buildSelect("👤 Assignee", userNames, this.filters.assignee, (v) => {
        this.filters.assignee = v;
        this.applyFilters();
      }),
    );
    filtersWrap.appendChild(
      this.buildSelect(
        "🏁 Milestone",
        mileNames,
        this.filters.milestone,
        (v) => {
          this.filters.milestone = v;
          this.applyFilters();
        },
      ),
    );
    filtersWrap.appendChild(
      this.buildSelect(
        "⚡ Priority",
        ["high", "medium", "low"],
        this.filters.priority,
        (v) => {
          this.filters.priority = v;
          this.applyFilters();
        },
      ),
    );
    filtersWrap.appendChild(
      this.buildSelect("🏷 Tag", allTags, this.filters.tag, (v) => {
        this.filters.tag = v;
        this.applyFilters();
      }),
    );

    const clearBtn = document.createElement("button");
    clearBtn.className = "ms-btn ms-btn-ghost";
    clearBtn.textContent = "✕ Clear";
    clearBtn.style.fontSize = "11px";
    clearBtn.addEventListener("click", () => {
      this.filters = {
        search: "",
        assignee: "",
        milestone: "",
        priority: "",
        tag: "",
      };
      this.render();
    });
    filtersWrap.appendChild(clearBtn);
    bar.appendChild(filtersWrap);

    // Panel toggle buttons
    const usersBtn = document.createElement("button");
    usersBtn.className =
      "ms-btn ms-btn-panel" + (this.activePanel === "users" ? " active" : "");
    usersBtn.textContent = "👥 Users";
    usersBtn.addEventListener("click", () => {
      this.activePanel = this.activePanel === "users" ? null : "users";
      this.render();
    });
    bar.appendChild(usersBtn);

    const milesBtn = document.createElement("button");
    milesBtn.className =
      "ms-btn ms-btn-panel" +
      (this.activePanel === "milestones" ? " active" : "");
    milesBtn.textContent = "🏁 Milestones";
    milesBtn.addEventListener("click", () => {
      this.activePanel =
        this.activePanel === "milestones" ? null : "milestones";
      this.render();
    });
    bar.appendChild(milesBtn);

    // New task button
    const newTaskBtn = document.createElement("button");
    newTaskBtn.className = "ms-btn ms-btn-primary";
    newTaskBtn.textContent = "＋ New Task";
    newTaskBtn.addEventListener("click", () => {
      openTaskModal(this.data, (d) => this.save(d));
    });
    bar.appendChild(newTaskBtn);

    return bar;
  }

  private buildSelect(
    placeholder: string,
    options: string[],
    current: string,
    onChange: (v: string) => void,
  ): HTMLSelectElement {
    const sel = document.createElement("select");
    sel.className = "ms-select";

    const def = document.createElement("option");
    def.value = "";
    def.textContent = placeholder;
    sel.appendChild(def);

    options.forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o;
      opt.textContent = o;
      if (o === current) opt.selected = true;
      sel.appendChild(opt);
    });

    sel.addEventListener("change", () => onChange(sel.value));
    return sel;
  }

  // Stats bar

  private buildStatsbar(): HTMLElement {
    const bar = document.createElement("div");
    bar.className = "ms-statsbar";

    const visible = this.data.tasks.filter((t) =>
      matchesFilter(t, this.filters),
    ).length;
    const done = this.data.tasks.filter((t) => t.col === "done").length;
    const high = this.data.tasks.filter((t) => t.priority === "high").length;

    const stats = [
      { color: "#4f6ef7", text: `${this.data.tasks.length} tasks` },
      { color: "#10b981", text: `${done} done` },
      { color: "#ef4444", text: `${high} high priority` },
      { color: "#8892b0", text: `${visible} matching` },
      { color: "#f59e0b", text: `${this.data.milestones.length} milestones` },
      { color: "#5eead4", text: `${this.data.users.length} members` },
    ];

    stats.forEach(({ color, text }) => {
      const stat = document.createElement("div");
      stat.className = "ms-stat";
      stat.innerHTML = `<span class="ms-dot" style="background:${color}"></span>${text}`;
      bar.appendChild(stat);
    });

    return bar;
  }

  // Board

  private buildBoard(): HTMLElement {
    const board = document.createElement("div");
    board.className = "ms-board";

    this.data.columns.forEach((col) => {
      board.appendChild(
        buildColumn(col, this.data, this.filters, {
          onDrop: (colId) => this.handleDrop(colId),
          onAddCard: (colId) =>
            openTaskModal(this.data, (d) => this.save(d), colId),
          onEdit: (taskId) =>
            openTaskModal(this.data, (d) => this.save(d), undefined, taskId),
          onDelete: (taskId) => {
            this.save({
              ...this.data,
              tasks: this.data.tasks.filter((t) => t.id !== taskId),
            });
          },
          onDragStart: (taskId) => {
            this.dragId = taskId;
          },
          onDragEnd: () => {
            this.dragId = null;
          },
        }),
      );
    });

    return board;
  }

  // Drag & Drop

  private handleDrop(colId: string): void {
    if (!this.dragId) return;
    const task = this.data.tasks.find((t) => t.id === this.dragId);
    if (task) {
      task.col = colId;
      this.save({ ...this.data });
    }
    this.dragId = null;
  }

  // Filter Application

  private applyFilters(): void {
    // Update card visibility without full re-render for performance
    this.containerEl
      .querySelectorAll<HTMLElement>(".ms-card")
      .forEach((card) => {
        const task = this.data.tasks.find((t) => t.id === card.dataset.id);
        if (task)
          card.classList.toggle(
            "ms-hidden",
            !matchesFilter(task, this.filters),
          );
      });

    // Update column counts
    this.data.columns.forEach((col) => {
      const colTasks = this.data.tasks.filter((t) => t.col === col.id);
      const visible = colTasks.filter((t) =>
        matchesFilter(t, this.filters),
      ).length;
      const countEl = this.containerEl.querySelector(
        `[data-col="${col.id}"] .ms-col-count`,
      );
      if (countEl) {
        countEl.textContent =
          visible + (colTasks.length !== visible ? `/${colTasks.length}` : "");
      }
    });

    // Refresh stats bar
    const statsbar = this.containerEl.querySelector(".ms-statsbar");
    if (statsbar) statsbar.replaceWith(this.buildStatsbar());
  }
}
