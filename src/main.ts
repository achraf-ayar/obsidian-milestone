import { Plugin, WorkspaceLeaf, addIcon } from "obsidian";
import { BoardView } from "./boardView";
import { MilestoneSettings, VIEW_TYPE, DEFAULT_SETTINGS } from "./constants";
import { MilestoneSettingTab } from "./settings";

const KANBAN_ICON = [
  `<rect x="8" y="8" width="22" height="84" rx="4" fill="currentColor"/>`,
  `<rect x="39" y="8" width="22" height="54" rx="4" fill="currentColor"/>`,
  `<rect x="70" y="8" width="22" height="68" rx="4" fill="currentColor"/>`,
].join("");

export default class MilestoneBoardPlugin extends Plugin {
  settings: MilestoneSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    addIcon("ms-kanban", KANBAN_ICON);

    this.registerView(
      VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new BoardView(leaf, this),
    );

    this.addRibbonIcon("ms-kanban", "Open milestone board", () => {
      void this.activateView();
    });

    // Command palette entry
    this.addCommand({
      id: "open-board",
      name: "Open board",
      callback: () => {
        void this.activateView();
      },
    });

    // Settings tab
    this.addSettingTab(new MilestoneSettingTab(this.app, this));
  }

  onunload(): void {
    // Nothing to clean up — Obsidian handles leaf lifecycle
  }

  private async activateView(): Promise<void> {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];

    if (!leaf) {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }

    workspace.revealLeaf(leaf);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
