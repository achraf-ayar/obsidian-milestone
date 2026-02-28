import { App, PluginSettingTab, Setting } from "obsidian";
import type MilestoneBoardPlugin from "./main";

// Settings Tab

export class MilestoneSettingTab extends PluginSettingTab {
  plugin: MilestoneBoardPlugin;

  constructor(app: App, plugin: MilestoneBoardPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Milestone board settings")
      .setHeading();

    new Setting(containerEl)
      .setName("Data file path")
      .setDesc("Path to the JSON file storing your board data")
      .addText((text) =>
        text
          .setPlaceholder("milestone-board.json")
          .setValue(this.plugin.settings.dataFile)
          .onChange((value) => {
            this.plugin.settings.dataFile = value || "milestone-board.json";
            void this.plugin.saveSettings();
          })
      );
  }
}
