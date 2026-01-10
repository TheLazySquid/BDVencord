import type { BdWebAddon } from "bd/types/addonstore";

const endpoint = "https://api.betterdiscord.app/v3/store/plugins";

export default class PluginStore {
    static plugins: BdWebAddon[] | null = null;

    static async getPlugins() {
        if(this.plugins) return this.plugins;
    
        // Fetch the plugins from the api
        const res = await fetch(endpoint);
        const data = await res.json();

        this.plugins = data.plugins;
        return this.plugins;
    }
}