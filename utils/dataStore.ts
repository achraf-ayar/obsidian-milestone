import { App, Notice, TFile } from "obsidian";
import { SEED_TASKS, DEFAULT_COLUMNS, DEFAULT_USERS, DEFAULT_MILESTONES } from "../src/constants";
import { BoardData } from "../src/types";


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
        const parsed = JSON.parse(raw);
        return {
          tasks: parsed.tasks ?? SEED_TASKS,
          columns: parsed.columns ?? DEFAULT_COLUMNS,
          users: parsed.users ?? DEFAULT_USERS,
          milestones: parsed.milestones ?? DEFAULT_MILESTONES,
        };
      } catch {
        new Notice(
          "Milestone Board: Could not parse data file — using defaults.",
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
    };
  }
}
