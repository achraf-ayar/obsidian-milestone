import { App, Notice, TFile } from "obsidian";
import { SEED_TASKS, DEFAULT_COLUMNS, DEFAULT_USERS, DEFAULT_MILESTONES, DEFAULT_TAGS } from "../src/constants";
import { BoardData, BoardTask } from "../src/types";

/** Legacy task shape that may include a single `assignee` field. */
interface LegacyTask extends BoardTask {
  assignee?: string;
}

/** Shape of the raw JSON before migration. */
interface RawBoardData {
  tasks?: LegacyTask[];
  columns?: BoardData["columns"];
  users?: BoardData["users"];
  milestones?: BoardData["milestones"];
  tags?: BoardData["tags"];
}


// Data Store: reads and writes the board JSON file in the vault

export class DataStore {
  private app: App;
  private filePath: string;

  constructor(app: App, filePath: string) {
    this.app = app;
    this.filePath = filePath;
  }

  updatePath(filePath: string): void {
    this.filePath = filePath;
  }

  async load(): Promise<BoardData> {
    const file = this.app.vault.getAbstractFileByPath(this.filePath);

    if (file instanceof TFile) {
      try {
        const raw = await this.app.vault.read(file);
        const parsed = JSON.parse(raw) as RawBoardData;
        const rawTasks: LegacyTask[] = parsed.tasks ?? SEED_TASKS;
        const tasks: BoardTask[] = rawTasks.map((t) => ({
          id: t.id,
          col: t.col,
          title: t.title,
          desc: t.desc,
          priority: t.priority,
          milestone: t.milestone,
          tags: t.tags,
          createdAt: t.createdAt,
          // Migrate old single assignee → assignees array
          assignees: t.assignees ?? (t.assignee ? [t.assignee] : []),
        }));
        return {
          tasks,
          columns: parsed.columns ?? DEFAULT_COLUMNS,
          users: parsed.users ?? DEFAULT_USERS,
          milestones: parsed.milestones ?? DEFAULT_MILESTONES,
          tags: parsed.tags ?? DEFAULT_TAGS,
        };
      } catch {
        new Notice(
          "Milestone board: could not parse data file — using defaults.",
        );
      }
    }

    // File doesn't exist yet — create it with seed data
    const defaults = this.defaults();
    await this.save(defaults);
    return defaults;
  }

  async save(data: BoardData): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    const file = this.app.vault.getAbstractFileByPath(this.filePath);

    if (file instanceof TFile) {
      await this.app.vault.modify(file, json);
    } else {
      await this.app.vault.create(this.filePath, json);
    }
  }

  private defaults(): BoardData {
    return {
      tasks: SEED_TASKS,
      columns: DEFAULT_COLUMNS,
      users: DEFAULT_USERS,
      milestones: DEFAULT_MILESTONES,
      tags: DEFAULT_TAGS,
    };
  }
}
