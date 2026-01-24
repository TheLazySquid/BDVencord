import { BD_PLUGINS_DIR } from "bd/consts";
import AddonManager from "./addonmanager";
import Remote from "../polyfill/remote";
import { Logger } from "@utils/Logger";
import { parseJSDoc } from "bd/utils/jsdoc";
import { Settings } from "Vencord";
import toasts from "bd/stores/toasts";

const logger = new Logger("PluginManager", "#3E82E5", "BDVencord");

export interface PluginMeta {
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

export interface BDPlugin extends PluginMeta {
    exports: any;
    instance?: PluginInstance;
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
    addonList: BDPlugin[] = [];
    _initResolve?: () => void;
    initialized = new Promise<void>(res => this._initResolve = res);

    async initialize() {
        const pluginInfo = await VencordNative.bd.getPlugins();
        for (const info of pluginInfo) {
            const plugin = this.initPlugin(info);
            if (plugin) this.addonList.push(plugin);
        }
        this.sortAddons();

        let started = 0;
        for (const plugin of this.addonList) {
            if (!Settings.bdplugins[plugin.id]) continue;

            let success = this.startPlugin(plugin, false);
            if (success) started++;
        }

        if (started > 0) {
            const message = `Started ${started} BetterDiscord plugin${started !== 1 ? "s" : ""}`;
            toasts.show(message, { type: "success" });
        }

        VencordNative.bd.addSwitchListener(() => this.onSwitch());
        this.watchChanges();

        this._initResolve?.();
    }

    initPlugin(info: PluginInfo) {
        // Parse the plugin's metadata
        const newlineIndex = info.code.indexOf("\n");
        const firstLine = info.code.slice(0, newlineIndex);
        if (!firstLine.includes("/**")) {
            logger.error(`Plugin ${info.file} is missing jsdoc header`);
            toasts.show(`${info.file} is not a valid BetterDiscord plugin`, { type: "error" });
            return;
        }

        const plugin = parseJSDoc(info.code) as Partial<BDPlugin>;
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

        return plugin as BDPlugin;
    }

    startPlugin(plugin: BDPlugin, toast = true) {
        try {
            const start = performance.now();

            // Load and start the plugin
            if (!plugin.instance) this.loadPlugin(plugin);
            plugin.instance?.start();

            const end = performance.now();
            logger.log(`Loaded ${plugin.name} in ${(end - start).toFixed(2)}ms`);

            if (toast) toasts.show(`Started BetterDiscord plugin ${plugin.name}`, { type: "success" });
            return true;
        } catch (e) {
            logger.error("Failed to start", plugin.name, e);
            toasts.show(`Failed to start BetterDiscord plugin ${plugin.name}`, { type: "error" });
            return false;
        }
    }

    stopPlugin(plugin: BDPlugin, toast = true) {
        try {
            plugin.instance?.stop();
            logger.log(`Stopped ${plugin.name}`);

            if (toast) toasts.show(`Stopped BetterDiscord plugin ${plugin.name}`, { type: "success" });
            return true;
        } catch (e) {
            logger.error("Failed to stop", plugin.name, e);
            toasts.show(`Failed to stop BetterDiscord plugin ${plugin.name}`, { type: "error" });
            return false;
        }
    }

    loadPlugin(plugin: BDPlugin) {
        // Evaluate the plugin
        const code = plugin.fileContent +
            `\nif(module.exports.default) module.exports = module.exports.default;` +
            `\nelse if(typeof module.exports !== "function") module.exports = eval("${plugin.name}");` +
            `\n//# sourceURL=betterdiscord://bdplugins/${plugin.filename}`;

        const wrappedPlugin = new Function("require", "module", "exports", "__filename", "__dirname", "global", code);
        const filePath = Remote.path.join(BD_PLUGINS_DIR, plugin.filename);

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
        if (instance.observer) this.setupObserver();
    }

    watchChanges() {
        VencordNative.bd.addPluginDeleteListener((filename) => {
            const plugin = this.getAddon(filename);
            if (plugin) this.deletePlugin(plugin);
        });

        VencordNative.bd.addPluginCreateListener((info) => {
            this.createPlugin(info);
        });

        VencordNative.bd.addPluginUpdateListener((info) => {
            const oldPlugin = this.getAddon(info.file);
            if (oldPlugin) this.updatePlugin(oldPlugin, info);
            else this.createPlugin(info);
        });
    }

    deletePlugin(plugin: BDPlugin, removeFile = false) {
        const index = this.addonList.indexOf(plugin);
        if (index === -1) return;

        if (Settings.bdplugins[plugin.id]) this.stopPlugin(plugin, false);
        if (removeFile) VencordNative.bd.deletePlugin(plugin.filename);

        this.addonList.splice(index, 1);
        this.emitChange();

        toasts.show(`Deleted BetterDiscord plugin ${plugin.name}`, { type: "success" });
    }

    updatePlugin(plugin: BDPlugin, newInfo: PluginInfo, updateFile = false) {
        if (plugin.fileContent === newInfo.code) return;

        plugin.added = newInfo.added;
        plugin.modified = newInfo.modified;
        plugin.size = newInfo.size;
        plugin.fileContent = newInfo.code;

        const enabled = Settings.bdplugins[plugin.id];
        if (enabled) {
            this.stopPlugin(plugin, false);
            plugin.instance = undefined;
            this.startPlugin(plugin, false);
        }

        if (updateFile) VencordNative.bd.updatePlugin(plugin.filename, newInfo.code);
        toasts.show(`Updated BetterDiscord plugin ${plugin.name}`, { type: "success" });
    }

    createPlugin(info: PluginInfo, enable = false, writeFile = false) {
        const plugin = this.initPlugin(info);
        if (!plugin) return;

        if (Settings.bdplugins[plugin.id]) this.startPlugin(plugin);
        else if (enable) this.enable(plugin);
        else toasts.show(`Added BetterDiscord plugin ${plugin.name}`, { type: "success" });

        this.addonList.push(plugin);
        this.sortAddons();
        this.emitChange();

        if (writeFile) VencordNative.bd.createPlugin(plugin.filename, info.code);
    }

    sortAddons() {
        this.addonList.sort((a, b) => a.name.localeCompare(b.name));
    }

    enable(plugin: BDPlugin, toast = true) {
        if (Settings.bdplugins[plugin.id]) return;

        const success = this.startPlugin(plugin, toast);
        if (success) Settings.bdplugins[plugin.id] = true;
    }

    disable(plugin: BDPlugin, toast = true) {
        if (!Settings.bdplugins[plugin.id]) return;

        this.stopPlugin(plugin, toast);
        Settings.bdplugins[plugin.id] = false;
    }

    toggle(plugin: BDPlugin) {
        if (Settings.bdplugins[plugin.id]) {
            this.stopPlugin(plugin);
        } else {
            const success = this.startPlugin(plugin);
            if (!success) return;
        }

        Settings.bdplugins[plugin.id] = !Settings.bdplugins[plugin.id];
    }

    enableAll() {
        let enabled = 0;
        for (const plugin of this.addonList) {
            if (Settings.bdplugins[plugin.id]) continue;

            this.enable(plugin, false);
            enabled++;
        }

        const message = `Enabled ${enabled} BetterDiscord plugin${enabled !== 1 ? "s" : ""}`;
        toasts.show(message, { type: "success" });
    }

    disableAll() {
        let disabled = 0;
        for (const plugin of this.addonList) {
            if (!Settings.bdplugins[plugin.id]) continue;

            this.disable(plugin, false);
            disabled++;
        }

        const message = `Disabled ${disabled} BetterDiscord plugin${disabled !== 1 ? "s" : ""}`;
        toasts.show(message, { type: "success" });
    }

    getPlugin(idOrFile: string) { return this.getAddon(idOrFile); }
    getAddon(idOrFile: string) {
        return this.addonList.find(a => a.id === idOrFile || a.filename === idOrFile);
    }

    isEnabled(idOrFile: string) {
        const plugin = this.getAddon(idOrFile);
        if (!plugin) return false;

        return Settings.bdplugins[plugin.id] ?? false;
    }

    enableAddon(idOrAddon: string) {
        const plugin = this.getAddon(idOrAddon);
        if (plugin) this.enable(plugin);
    }

    disableAddon(idOrAddon: string) {
        const plugin = this.getAddon(idOrAddon);
        if (plugin) this.disable(plugin);
    }

    toggleAddon(idOrAddon: string) {
        const plugin = this.getAddon(idOrAddon);
        if (plugin) this.toggle(plugin);
    }

    reloadAddon(idOrAddon: string) {
        const plugin = this.getAddon(idOrAddon);
        if (!plugin || !Settings.bdplugins[plugin.id]) return;

        this.stopPlugin(plugin);
        this.startPlugin(plugin);
    }

    onSwitch() {
        for (const plugin of this.addonList) {
            try {
                plugin.instance?.onSwitch?.();
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
            if (typeof plugin.instance?.observer !== "function") continue;
            try {
                plugin.instance.observer(mutation);
            } catch (e) {
                console.error("plugin observer failed for " + plugin.name, e);
            }
        }
    }
};