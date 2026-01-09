import { BD_PLUGINS_DIR } from "bd/consts";
import AddonManager from "./addonmanager";
import Remote from "../polyfill/remote";
import { Logger } from "@utils/Logger";
import { parseJSDoc } from "bd/utils/jsdoc";
import Modals from "bd/ui/modals";
import CommandManager, { CommandTypes, OptionType } from "./commandmanager";

const logger = new Logger("BD", "#3E82E5");

interface PluginMeta {
    added: number;
    author: string;
    authorId?: string;
    authorLink?: string;
    description: string;
    donate?: string;
    fileContent?: string;
    filename: string;
    format: string;
    id: string;
    invite?: string;
    modified: number;
    name: string;
    partial?: boolean;
    patreon?: string;
    size: number;
    slug: string;
    source?: string;
    version: string;
    website?: string;
}

interface PluginInstance {
    start(): void;
    stop(): void;
    observer?(m: MutationRecord): void;
    getSettingsPanel?(): any;
    onSwitch?(): void;
}

interface Plugin extends PluginMeta {
    exports: any;
    instance: PluginInstance;
}

export interface PluginInfo {
    code: string;
    file: string;
    size: number;
    modified: number;
    added: number;
}

export default new class PluginManager extends AddonManager {
    addonFolder = "plugins";
    addonList: Plugin[] = [];

    async initialize() {
        const plugins = await VencordNative.bd.getPlugins();

        for (const pluginInfo of plugins) {
            try {
                const start = performance.now();
                const plugin = this.loadPlugin(pluginInfo);
                const end = performance.now();

                logger.log(`Loaded ${plugin.name} in ${(end - start).toFixed(2)}ms`);
            } catch (e) {
                logger.error(`Failed to load ${pluginInfo.file}`, e);
            }
        }

        VencordNative.bd.addSwitchListener(() => this.onSwitch());

        // Temporary: Add a command to open settings
        const addonList = this.addonList;
        CommandManager.registerCommand("BD", {
            id: "bdsettings",
            name: "bdsettings",
            description: "Open the settings of a BetterDiscord plugin",
            predicate: () => addonList.some(p => p.instance.getSettingsPanel),
            options: [
                {
                    type: OptionType.STRING,
                    name: "plugin",
                    description: "The plugin to open the settings for",
                    required: true,
                    get choices() {
                        return addonList.filter(p => p.instance.getSettingsPanel).map(p => ({
                            label: p.name,
                            name: p.name,
                            displayName: p.name,
                            value: p.id
                        }));
                    }
                }
            ],
            execute: (data) => {
                const id = data.find(o => o.name === "plugin")?.value;
                if (!id) return;

                const plugin = this.getPlugin(id);
                if (!plugin) return;

                const getSettingsPanel = plugin.instance.getSettingsPanel?.bind(plugin.instance);
                if (!getSettingsPanel) return;

                Modals.showAddonSettingsModal(plugin.name, getSettingsPanel());
            }
        });
    }

    loadPlugin(info: PluginInfo) {
        const newlineIndex = info.code.indexOf("\n");
        const firstLine = info.code.slice(0, newlineIndex);
        if (!firstLine.includes("/**")) throw new Error("Missing JSDoc header");

        // Get the plugin's metadata
        const plugin = parseJSDoc(info.code) as Partial<Plugin>;
        if (!plugin.author) plugin.author = "Unknown";
        if (!plugin.version) plugin.version = "???";
        if (!plugin.description) plugin.description = "Description not provided.";

        plugin.id = plugin.name || info.file;
        plugin.slug = info.file.replace(".plugin.js", "").replace(/ /g, "-");
        plugin.filename = info.file;
        plugin.added = info.added;
        plugin.modified = info.modified;
        plugin.size = info.size;
        plugin.fileContent = info.code;

        // Evaluate the plugin
        const code = info.code +
            `\nif(module.exports.default) module.exports = module.exports.default;` +
            `\nelse if(typeof module.exports !== "function") module.exports = eval("${plugin.name}");` +
            `\n//# sourceURL=betterdiscord://bdplugins/${info.file}`;

        const wrappedPlugin = new Function("require", "module", "exports", "__filename", "__dirname", "global", code);
        const filePath = Remote.path.join(BD_PLUGINS_DIR, info.file);

        const module = { filename: filePath, exports: {} };
        wrappedPlugin(window.require, module, module.exports, module.filename, BD_PLUGINS_DIR, window);
        plugin.exports = module.exports;

        // Create and run an instance
        if (typeof plugin.exports !== "function") throw new Error("Plugin does not export a class/function");

        const PluginClass = plugin.exports;
        const meta = Object.assign({}, plugin);
        delete meta.exports;

        const instance: PluginInstance = PluginClass.prototype ? new PluginClass(meta) : plugin.exports(meta);
        if (!instance.start || !instance.stop) throw new Error("Plugin instance is missing start or stop method");

        plugin.instance = instance;
        this.addonList.push(plugin as Plugin);

        instance.start();
        if (instance.observer) this.setupObserver();

        return plugin;
    }

    getPlugin(idOrFile: string) { return this.getAddon(idOrFile); }
    getAddon(idOrFile: string) {
        return this.addonList.find(a => a.id === idOrFile || a.filename === idOrFile);
    }

    isEnabled(idOrFile: string) {
        if (!this.getPlugin(idOrFile)) return false;
        return true;
    }

    onSwitch() {
        for (const plugin of this.addonList) {
            try {
                plugin.instance.onSwitch?.();
            } catch (e) {
                console.error("onSwitch failed for " + plugin.name, e);
            }
        }
    }

    observerCreated = false;
    setupObserver() {
        if (this.observerCreated) return;
        this.observerCreated = true;

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                this.onMutation(mutation);
            }
        });

        observer.observe(document, {
            childList: true,
            subtree: true
        });
    }

    onMutation(mutation: MutationRecord) {
        for (const plugin of this.addonList) {
            try {
                plugin.instance.observer?.(mutation);
            } catch (e) {
                console.error("plugin observer failed for " + plugin.name, e);
            }
        }
    }
};