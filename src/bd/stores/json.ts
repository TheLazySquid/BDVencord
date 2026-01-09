import fs from "../polyfill/fs";
import Remote from "bd/polyfill/remote";
import Store from "./base";
import Logger from "../core/logger";
import {React} from "@webpack/common";
import { BD_PLUGINS_DIR } from "bd/consts";


export type Files = "settings" | "plugins" | "themes" | "misc" | "addon-store";

export default new class JsonStore extends Store {
    private pluginCache: Record<string, Record<string, unknown>> = {};
    private pluginListeners = new Map<string, {
        keys: Map<string, Set<(newData?: unknown) => void>>,
        all: Set<(key: string, newData?: unknown) => void>;
    }>();

    // Plugin data
    #getPluginFile(pluginName: string) {
        return Remote.path.resolve(BD_PLUGINS_DIR, pluginName + ".config.json");
    }

    #ensurePluginData(pluginName: string) {
        if (typeof (this.pluginCache[pluginName]) !== "undefined") return; // Already have data cached

        // Setup blank data if config doesn't exist
        if (!fs.existsSync(this.#getPluginFile(pluginName))) return this.pluginCache[pluginName] = {};

        try {
            // Getting here means not cached, read from disk
            this.pluginCache[pluginName] = JSON.parse(fs.readFileSync(this.#getPluginFile(pluginName)).toString());
        }
        catch {
            // Setup blank data if parse fails
            return this.pluginCache[pluginName] = {};
        }
    }

    public recache(pluginName: string) {
        this.#ensurePluginData(pluginName);
        const before = this.pluginCache[pluginName];

        try {
            this.pluginCache[pluginName] = JSON.parse(fs.readFileSync(this.#getPluginFile(pluginName)).toString());
            this.emitChange();
            return true;
        }
        catch (err) {
            Logger.err("JsonStore", "recache: ", err);
            return false;
        }
        finally {
            const after = this.pluginCache[pluginName];

            const beforeKeys = Object.keys(before);
            const afterKeys = Object.keys(after);

            const beforeSet = new Set(beforeKeys);
            const afterSet = new Set(afterKeys);

            const result: {
                deleted: string[];
                changed: string[];
            } = {
                deleted: [],
                changed: []
            };

            for (const k of beforeSet) {
                if (afterSet.has(k)) result.changed.push(k);
                else result.deleted.push(k);
            }

            for (const k of afterSet) {
                if (!beforeSet.has(k)) {
                    result.changed.push(k);
                }
            }

            for (const key of result.changed) {
                this.emitPluginChangeListeners(pluginName, key, after[key]);
            }

            for (const key of result.deleted) {
                this.emitPluginChangeListeners(pluginName, key);
            }
        }
    }

    #savePluginData(pluginName: string) {
        fs.writeFileSync(this.#getPluginFile(pluginName), JSON.stringify(this.pluginCache[pluginName], null, 4));
        this.emitChange();
    }

    public getData<T>(pluginName: string, key: string): T {
        this.#ensurePluginData(pluginName); //       Ensure plugin data, if any, is cached
        return this.pluginCache[pluginName][key] as T; // Return blindly to allow falsey values
    }

    public useData<T>(pluginName: string, key: string): T {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [state, setState] = React.useState(() => this.getData<T>(pluginName, key));

        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useInsertionEffect(() => {
            const listener = () => setState(() => this.getData<T>(pluginName, key));

            listener();

            return this.addPluginChangeListener(pluginName, listener, key);
        }, []);

        return state;
    }

    public setData(pluginName: string, key: string, value: unknown) {
        if (value === undefined) return; // Can't set undefined, use deletePluginData
        this.#ensurePluginData(pluginName); // Ensure plugin data, if any, is cached

        this.pluginCache[pluginName][key] = value;
        this.#savePluginData(pluginName);
        this.emitPluginChangeListeners(pluginName, key, value);
    }

    public deleteData(pluginName: string, key: string) {
        this.#ensurePluginData(pluginName); // Ensure plugin data, if any, is cached
        delete this.pluginCache[pluginName][key];
        this.#savePluginData(pluginName);
        this.emitPluginChangeListeners(pluginName, key);
    }

    private emitPluginChangeListeners(pluginName: string, key: string, newData?: unknown) {
        if (!this.pluginListeners.has(pluginName)) return;

        const pluginListeners = this.pluginListeners.get(pluginName)!;

        for (const element of pluginListeners.all) {
            // So plugins can do arguments.length === 1 to see if it was a delete
            if (arguments.length === 3) {
                element(key, newData);
            }
            else {
                element(key);
            }
        }

        if (!pluginListeners.keys.has(key)) return;

        const listeners = pluginListeners.keys.get(key)!;

        for (const element of listeners) {
            // So plugins can do arguments.length === 0 to see if it was a delete
            if (arguments.length === 3) {
                element(newData);
            }
            else {
                element();
            }
        }
    }

    public addPluginChangeListener(pluginName: string, callback: any, key?: string | undefined) {
        if (!this.pluginListeners.has(pluginName)) {
            this.pluginListeners.set(pluginName, {
                keys: new Map(),
                all: new Set()
            });
        }

        const listeners = this.pluginListeners.get(pluginName)!;

        if (typeof key === "string") {
            if (!listeners.keys.has(key)) listeners.keys.set(key, new Set());

            const keyListeners = listeners.keys.get(key)!;
            keyListeners.add(callback);

            return () => void keyListeners.delete(callback);
        }

        listeners.all.add(callback);
        return () => void listeners.all.delete(callback);
    }
    public removePluginChangeListener(pluginName: string, callback: any, key?: string | undefined) {
        if (!this.pluginListeners.has(pluginName)) return;

        const listeners = this.pluginListeners.get(pluginName)!;

        if (typeof key === "string") {
            if (!listeners.keys.has(key)) return;

            listeners.keys.get(key)!.delete(callback);
            return;
        }

        listeners.all.delete(callback);
    }
};