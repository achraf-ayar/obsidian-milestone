

// Plugin Entry Point

import { BoardView } from "./boardView";
import { MilestoneSettings, VIEW_TYPE, DEFAULT_SETTINGS } from "./constants";

export default class MilestoneBoardPlugin extends Plugin {
  settings: MilestoneSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    // Register the board view
    this.registerView(
      VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new BoardView(leaf, this),
    );

    // Ribbon icon
    this.addRibbonIcon("layout-dashboard", "Open Milestone Board", () => {
      this.activateView();
    });

    // Command palette entry
    this.addCommand({
      id: "open-milestone-board",
      name: "Open Milestone Board",
      callback: () => this.activateView(),
    });

    // Settings tab
    this.addSettingTab(new MilestoneSettingTab(this.app, this));
  }

  async onunload(): Promise<void> {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
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
