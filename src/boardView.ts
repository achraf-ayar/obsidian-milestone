import { ItemView, WorkspaceLeaf } from "obsidian";
import type { BoardData, BoardFilters, ActivePanel } from "./types";
import { VIEW_TYPE } from "./constants";
import { STYLES } from "./styles";
import type MilestoneBoardPlugin from "./main";
import { buildColumn } from "../components/Column";
import { openTaskModal } from "../modals/TaskModal";
import { openSettingsModal } from "../modals/SettingsModal";
import { buildMilestonesPanel } from "../panels/MilestonePanel";
import { buildUsersPanel } from "../panels/UsersPanel";
import { buildTagsPanel } from "../panels/TagsPanel";
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
  private showStats: boolean;

  constructor(leaf: WorkspaceLeaf, plugin: MilestoneBoardPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.store = new DataStore(this.app, plugin.settings.dataFile);
    this.data = { tasks: [], columns: [], users: [], milestones: [], tags: [] };
    this.filters = {
      search: "",
      assignee: "",
      milestone: "",
      priority: "",
      tag: "",
    };
    this.activePanel = null;
    this.dragId = null;
    this.showStats = false;
  }

  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Milestone Board";
  }
  getIcon() {
    return "ms-kanban";
  }

  async onOpen() {
    // Apply all saved default filters on every open
    const df = this.plugin.settings.defaultFilters;
    if (df) {
      this.filters = {
        search: df.search ?? "",
        assignee: df.assignee ?? "",
        milestone: df.milestone ?? "",
        priority: df.priority ?? "",
        tag: df.tag ?? "",
      };
    }
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

    if (this.showStats) {
      root.appendChild(this.buildStatsDashboard());
      return;
    }

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
    } else if (this.activePanel === "tags") {
      body.appendChild(
        buildTagsPanel(
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
      this.showStats = false;
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
      this.showStats = false;
      this.activePanel = this.activePanel === "milestones" ? null : "milestones";
      this.render();
    });
    bar.appendChild(milesBtn);

    const tagsBtn = document.createElement("button");
    tagsBtn.className =
      "ms-btn ms-btn-panel" + (this.activePanel === "tags" ? " active" : "");
    tagsBtn.textContent = "🏷 Tags";
    tagsBtn.addEventListener("click", () => {
      this.showStats = false;
      this.activePanel = this.activePanel === "tags" ? null : "tags";
      this.render();
    });
    bar.appendChild(tagsBtn);

    const statsBtn = document.createElement("button");
    statsBtn.className =
      "ms-btn ms-btn-panel" + (this.showStats ? " active" : "");
    statsBtn.textContent = "📊 Stats";
    statsBtn.addEventListener("click", () => {
      this.showStats = !this.showStats;
      if (this.showStats) this.activePanel = null;
      this.render();
    });
    bar.appendChild(statsBtn);

    // New task button
    const newTaskBtn = document.createElement("button");
    newTaskBtn.className = "ms-btn ms-btn-primary";
    newTaskBtn.textContent = "＋ New Task";
    newTaskBtn.addEventListener("click", () => {
      openTaskModal(this.data, (d) => this.save(d));
    });
    bar.appendChild(newTaskBtn);

    // Settings button (after New Task)
    const settingsBtn = document.createElement("button");
    settingsBtn.className = "ms-btn ms-btn-icon";
    settingsBtn.title = "Board Settings";
    settingsBtn.textContent = "⚙";
    settingsBtn.addEventListener("click", () => {
      openSettingsModal(this.plugin, this.data, (newFilters) => {
        this.filters = { ...newFilters };
        this.render();
      });
    });
    bar.appendChild(settingsBtn);

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

  // Stats Dashboard

  private buildStatsDashboard(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "ms-stats-dash";

    const tasks = this.data.tasks;
    const total = tasks.length;
    const done = tasks.filter((t) => t.col === "done").length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    // --- Overview cards row ---
    const overview = document.createElement("div");
    overview.className = "ms-stats-row";

    const overviewCards = [
      { label: "Total Tasks", value: String(total), color: "#4f6ef7", icon: "📋" },
      { label: "Completed", value: `${done} (${pct}%)`, color: "#10b981", icon: "✅" },
      { label: "High Priority", value: String(tasks.filter((t) => t.priority === "high").length), color: "#ef4444", icon: "🔴" },
      { label: "Team Members", value: String(this.data.users.length), color: "#5eead4", icon: "👥" },
      { label: "Milestones", value: String(this.data.milestones.length), color: "#f59e0b", icon: "🏁" },
      { label: "Tags", value: String(this.data.tags.length), color: "#a855f7", icon: "🏷" },
    ];

    overviewCards.forEach(({ label, value, color, icon }) => {
      const card = document.createElement("div");
      card.className = "ms-stats-card";
      card.innerHTML = `
        <div class="ms-stats-card-icon" style="background:color-mix(in srgb, ${color} 15%, transparent);color:${color}">${icon}</div>
        <div class="ms-stats-card-value">${value}</div>
        <div class="ms-stats-card-label">${label}</div>
      `;
      overview.appendChild(card);
    });
    wrap.appendChild(overview);

    // --- Charts row ---
    const chartsRow = document.createElement("div");
    chartsRow.className = "ms-stats-charts";

    // Tasks by Column
    chartsRow.appendChild(this.buildBarChart(
      "Tasks by Column",
      this.data.columns.map((c) => ({
        label: c.label.replace(/^.+\s/, ""),
        value: tasks.filter((t) => t.col === c.id).length,
        color: c.color,
      })),
    ));

    // Tasks by Priority
    const priData = [
      { label: "High", value: tasks.filter((t) => t.priority === "high").length, color: "#ef4444" },
      { label: "Medium", value: tasks.filter((t) => t.priority === "medium").length, color: "#f59e0b" },
      { label: "Low", value: tasks.filter((t) => t.priority === "low").length, color: "#10b981" },
    ];
    chartsRow.appendChild(this.buildBarChart("Tasks by Priority", priData));

    // Tasks by Assignee
    const userCounts = this.data.users.map((u) => ({
      label: u.name,
      value: tasks.filter((t) => (t.assignees ?? []).includes(u.name)).length,
      color: u.color,
    })).sort((a, b) => b.value - a.value);
    const unassigned = tasks.filter((t) => !(t.assignees ?? []).length).length;
    if (unassigned > 0) userCounts.push({ label: "Unassigned", value: unassigned, color: "#6b7280" });
    chartsRow.appendChild(this.buildBarChart("Tasks by Assignee", userCounts));

    wrap.appendChild(chartsRow);

    // --- Second charts row ---
    const chartsRow2 = document.createElement("div");
    chartsRow2.className = "ms-stats-charts";

    // Tasks by Milestone
    const mileCounts = [...this.data.milestones]
      .sort((a, b) => a.order - b.order)
      .map((m) => {
        const mTasks = tasks.filter((t) => t.milestone === m.name);
        const mDone = mTasks.filter((t) => t.col === "done").length;
        return { label: `${m.name}`, value: mTasks.length, color: m.color, done: mDone };
      });
    const noMile = tasks.filter((t) => !t.milestone).length;
    if (noMile > 0) mileCounts.push({ label: "No milestone", value: noMile, color: "#6b7280", done: 0 });
    chartsRow2.appendChild(this.buildBarChart("Tasks by Milestone", mileCounts));

    // Tasks by Tag
    const tagCounts = this.data.tags.map((tag) => ({
      label: `#${tag.name}`,
      value: tasks.filter((t) => t.tags?.includes(tag.name)).length,
      color: tag.color,
    })).sort((a, b) => b.value - a.value);
    chartsRow2.appendChild(this.buildBarChart("Tasks by Tag", tagCounts.length > 0 ? tagCounts : [{ label: "No tags", value: 0, color: "#6b7280" }]));

    // Milestone progress
    const mileProgress = [...this.data.milestones]
      .sort((a, b) => a.order - b.order)
      .map((m) => {
        const mTasks = tasks.filter((t) => t.milestone === m.name);
        const mDone = mTasks.filter((t) => t.col === "done").length;
        const mPct = mTasks.length ? Math.round((mDone / mTasks.length) * 100) : 0;
        return { label: m.label || m.name, value: mPct, color: m.color, suffix: "%" };
      });
    chartsRow2.appendChild(this.buildBarChart("Milestone Progress", mileProgress.length > 0 ? mileProgress : [{ label: "No milestones", value: 0, color: "#6b7280" }]));

    wrap.appendChild(chartsRow2);

    return wrap;
  }

  private buildBarChart(
    title: string,
    items: { label: string; value: number; color: string; suffix?: string }[],
  ): HTMLElement {
    const card = document.createElement("div");
    card.className = "ms-chart-card";

    const heading = document.createElement("div");
    heading.className = "ms-chart-title";
    heading.textContent = title;
    card.appendChild(heading);

    const maxVal = Math.max(...items.map((i) => i.value), 1);

    items.forEach(({ label, value, color, suffix }) => {
      const row = document.createElement("div");
      row.className = "ms-chart-row";

      const lbl = document.createElement("div");
      lbl.className = "ms-chart-label";
      lbl.textContent = label;

      const barWrap = document.createElement("div");
      barWrap.className = "ms-chart-bar-wrap";
      const bar = document.createElement("div");
      bar.className = "ms-chart-bar";
      bar.style.width = `${Math.max((value / maxVal) * 100, 2)}%`;
      bar.style.background = color;
      barWrap.appendChild(bar);

      const val = document.createElement("div");
      val.className = "ms-chart-val";
      val.textContent = `${value}${suffix ?? ""}`;

      row.appendChild(lbl);
      row.appendChild(barWrap);
      row.appendChild(val);
      card.appendChild(row);
    });

    return card;
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
    const { assignee, milestone, priority, tag, search } = this.filters;
    if (this.showStats && (assignee || milestone || priority || tag || search)) {
      this.showStats = false;
      this.render();
      return;
    }

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
