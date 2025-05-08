import { PluginSettingsTabBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsTabBase';
import { SettingEx } from 'obsidian-dev-utils/obsidian/SettingEx';

import type { PluginTypes } from './PluginTypes.ts';

export class PluginSettingsTab extends PluginSettingsTabBase<PluginTypes> {
  public override display(): void {
    super.display();
    this.containerEl.empty();

    new SettingEx(this.containerEl)
      .setName('Template')
      .setDesc('Give your template here. {{DAYFRAME}} will be replaced with the content from the daily note.')
      .addCodeHighlighter((codeHighlighter) => {
        codeHighlighter.setLanguage('markdown');
        this.bind(codeHighlighter, 'dayframeTemplateSetting');
      });

    new SettingEx(this.containerEl)
      .setName('Daily Note Format')
      .setDesc('The format of the daily note. Default is YYYY-MM-DD.')
      .addMomentFormat((momentFormat) => {
        this.bind(momentFormat, 'dailyNoteNameFormatSetting');
      });
  }
}
