import type { ExtractPluginSettingsWrapper } from 'obsidian-dev-utils/obsidian/Plugin/PluginTypesBase';
import type { ReadonlyDeep } from 'type-fest';

import {
  App,
  MarkdownView,
  WorkspaceLeaf,
  type PluginManifest} from 'obsidian';
import { PluginBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginBase';

import type { PluginTypes } from './PluginTypes.ts';

import { PluginSettingsManager } from './PluginSettingsManager.ts';
import { PluginSettingsTab } from './PluginSettingsTab.ts';
import { MarkdownRenderer } from "obsidian";
import { debounce, type DebouncedFuncLeading } from 'lodash';

export class Plugin extends PluginBase<PluginTypes> {
  private readonly observables: MutationObserver[] = [];
  private readonly debouncedDelegate: DebouncedFuncLeading<(leaf: any) => Promise<void>>; 

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);

    this.observables = [];
    this.debouncedDelegate = debounce(this.addDayFrameToDailyNote, 300, {
      leading: true,
      trailing: false,
    });
  }

  protected override createSettingsManager(): PluginSettingsManager {
    return new PluginSettingsManager(this);
  }

  protected override createSettingsTab(): null | PluginSettingsTab {
    return new PluginSettingsTab(this);
  }

  protected override async onLayoutReady(): Promise<void> {
    await super.onLayoutReady();
  }

  protected override async onloadImpl(): Promise<void> {
    await super.onloadImpl();

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => this.handleLeafChange(leaf!))
    );
  }

  protected override async onLoadSettings(
    loadedSettings: ReadonlyDeep<ExtractPluginSettingsWrapper<PluginTypes>>,
    isInitialLoad: boolean
  ): Promise<void> {
    await super.onLoadSettings(loadedSettings, isInitialLoad);
  }

  protected override async onSaveSettings(
    newSettings: ReadonlyDeep<ExtractPluginSettingsWrapper<PluginTypes>>,
    oldSettings: ReadonlyDeep<ExtractPluginSettingsWrapper<PluginTypes>>,
    context: unknown
  ): Promise<void> {
    await super.onSaveSettings(newSettings, oldSettings, context);
  }

  protected override async onunloadImpl(): Promise<void> {
    await super.onunloadImpl();
  }

  /**
   * Handles the change of the active leaf in the workspace.
   * @param leaf The new active leaf.
   */
  private async handleLeafChange (leaf: WorkspaceLeaf) {
    // Active leaf has changed

    // Cleanup previous observers
    while (this.observables.length) {
      const observer = this.observables.pop();
      if (observer) {
        observer.disconnect();
      }
    }

    // Check if the new active leaf is a Markdown view
    const view = leaf?.view;
    if ((view instanceof MarkdownView) && this.shouldHandleLeaf(leaf)) {
      await this.debouncedDelegate(leaf);

      // Add a new observer to watch for mode changes of the view
      const container = view.containerEl;
      const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes" && mutation.attributeName === "data-mode") { 
            await this.debouncedDelegate(leaf);
          }
        }
      });
      observer.observe(container, { attributes: true });
      this.observables.push(observer);
    } else {
      this.cleanupDayFrame(leaf);
    }
  };

  /**
   * Checks if the given leaf should be handled by the plugin.
   * @param leaf The workspace leaf to check.
   * @returns 
   */
  private shouldHandleLeaf(leaf: any) {
    if (!leaf) return false;
    const view = leaf.view;
    if (!view) return false;
    if (!(view instanceof MarkdownView)) return false;
    if (!view.file) return false;
    const basename = view.file.basename;
    if (!basename) return false;
    return !!basename.match(/^\d{4}-\d{2}-\d{2}$/);
  }

  /**
   * Adds the day frame to the daily note.
   * @param leaf The workspace leaf to add the day frame to.
   */
  private async addDayFrameToDailyNote(leaf: any) {
    this.consoleDebug("Adding day frame to daily note");
    
    const view = leaf?.view;    
    const file = leaf.view.file;

    // Check if the view mode is "preview"
    if (view.getMode() === "preview") {
      this.cleanupDayFrame(leaf);
      const container = leaf.view.containerEl.querySelector(".markdown-preview-view");
      if (!container) return;
      const { prefix, suffix } = this.getDayFrameTemplate();

      // Check if the prefix container exists. If it does, render the new prefix
      const prefixContainer = container.querySelector(".mod-header");
      if (prefixContainer) {
        const newPrefixEl = createDiv({ cls: "markdown-dayframe-prefix" });
        prefixContainer.append(newPrefixEl);
        await MarkdownRenderer.renderMarkdown(prefix, newPrefixEl, file!.path, this);
      }
      // Check if the suffix container exists. If it does, render the new suffix
      const suffixContainer = container.querySelector(".mod-footer");
      if (suffixContainer) {
        const newSuffixEl = createDiv({ cls: "markdown-dayframe-suffix" });
        suffixContainer.prepend(newSuffixEl);
        await MarkdownRenderer.renderMarkdown(suffix, newSuffixEl, file!.path, this);
      }
    } else {
      return Promise.resolve();
    }
  }

  
  /**
   * Cleans up the day frame elements (prefix and suffix) from the markdown preview.
   * @param leaf The workspace leaf to cleanup.
   */
  private cleanupDayFrame(leaf: any) {
    const container = leaf.view.containerEl.querySelector(".markdown-preview-view");
    let prefixEl = container?.querySelector(".markdown-dayframe-prefix");
    while (prefixEl) {
      prefixEl.remove();
      prefixEl = container?.querySelector(".markdown-dayframe-prefix");
    }
    let suffixEl = container?.querySelector(".markdown-dayframe-suffix");
    while (suffixEl) {
      suffixEl.remove();
      suffixEl = container?.querySelector(".markdown-dayframe-suffix");
    }
  }
    
  /**
   * Returns the day frame template parts (prefix and suffix) based on the settings.
   * @returns An object containing the prefix and suffix parts of the day frame template.
   */
  private getDayFrameTemplate(): { prefix: string; suffix: string } {
    const templateParts = this.settings.dayframeTemplateSetting.split("{{DAYFRAME}}").map((s) => s.trim() || '');
    return templateParts.length == 1 ? {
      prefix: templateParts[0] || '',
      suffix: '',
    } : {
      prefix: templateParts[0] || '',
      suffix: templateParts[1] || '',
    }
  }
}
