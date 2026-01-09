import { BD_PLUGINS_DIR } from "bd/consts";
import AddonManager from "./addonmanager";
import Remote from "../polyfill/remote";
import { Logger } from "@utils/Logger";
import { parseJSDoc } from "bd/utils/jsdoc";
import { Settings } from "Vencord";

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

    async initialize() {
        const pluginInfo = await VencordNative.bd.getPlugins();
        this.initPlugins(pluginInfo);

        for (const plugin of this.addonList) {
            if (!Settings.bdplugins[plugin.id]) continue;

            this.startPlugin(plugin);
        }

        VencordNative.bd.addSwitchListener(() => this.onSwitch());
    }

    initPlugins(pluginInfo: PluginInfo[]) {
        for (const info of pluginInfo) {
            // Parse the plugin's metadata
            const newlineIndex = info.code.indexOf("\n");
            const firstLine = info.code.slice(0, newlineIndex);
            if (!firstLine.includes("/**")) {
                logger.error(`Plugin ${info.file} is missing jsdoc header`);
                continue;
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

            this.addonList.push(plugin as BDPlugin);
        }
    }

    startPlugin(plugin: BDPlugin) {
        try {
            const start = performance.now();

            // Load and start the plugin
            if(!plugin.instance) this.loadPlugin(plugin);
            plugin.instance?.start();
            
            const end = performance.now();
            logger.log(`Loaded ${plugin.name} in ${(end - start).toFixed(2)}ms`);
            return true;
        } catch(e) {
            logger.error("Failed to start", plugin.name, e);
            return false;
        }
    }

    stopPlugin(plugin: BDPlugin) {
        try {
            plugin.instance?.stop();
            logger.log(`Stopped ${plugin.name}`);
        } catch(e) {
            logger.error("Failed to stop", plugin.name, e);
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

    getPlugin(idOrFile: string) { return this.getAddon(idOrFile); }
    getAddon(idOrFile: string) {
        return this.addonList.find(a => a.id === idOrFile || a.filename === idOrFile);
    }

    isEnabled(idOrFile: string) {
        const plugin = this.getAddon(idOrFile);
        if(!plugin) return false;

        return Settings.bdplugins[plugin.id] ?? false;
    }

    enableAddon(idOrAddon: string) {
        const plugin = this.getAddon(idOrAddon);
        if(!plugin || Settings.bdplugins[plugin.id]) return;

        const success = this.startPlugin(plugin);
        if(success) Settings.bdplugins[plugin.id] = true;
    }

    disableAddon(idOrAddon: string) {
        const plugin = this.getAddon(idOrAddon);
        if(!plugin || !Settings.bdplugins[plugin.id]) return;

        this.stopPlugin(plugin);
        Settings.bdplugins[plugin.id] = false;
    }

    toggleAddon(idOrAddon: string) {
        const plugin = this.getAddon(idOrAddon);
        if(!plugin) return;

        if(Settings.bdplugins[plugin.id]) {
            this.stopPlugin(plugin);
        } else {
            const success = this.startPlugin(plugin);
            if(!success) return;
        }

        Settings.bdplugins[plugin.id] = !Settings.bdplugins[plugin.id];
    }

    reloadAddon(idOrAddon: string) {
        const plugin = this.getAddon(idOrAddon);
        if(!plugin || !Settings.bdplugins[plugin.id]) return;

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
            try {
                plugin.instance?.observer?.(mutation);
            } catch (e) {
                console.error("plugin observer failed for " + plugin.name, e);
            }
        }
    }
};