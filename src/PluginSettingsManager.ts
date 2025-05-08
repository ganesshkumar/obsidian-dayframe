
import { PluginSettingsManagerBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsManagerBase';

import type { PluginTypes } from './PluginTypes.ts';

import {
  PluginSettings} from './PluginSettings.ts';

export class PluginSettingsManager extends PluginSettingsManagerBase<PluginTypes> {
  protected override createDefaultSettings(): PluginSettings {
    return new PluginSettings();
  }

  protected override async onLoadRecord(record: Record<string, unknown>): Promise<void> {
    await super.onLoadRecord(record);
  }

  protected override async onSavingRecord(record: Record<string, unknown>): Promise<void> {
    await super.onSavingRecord(record);
  }

  protected override registerValidators(): void {
    super.registerValidators();
  }
}
