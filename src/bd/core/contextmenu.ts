import ContextMenuPatcher from "bd/api/contextmenu";
import pluginmanager from "./pluginmanager";
import { Settings } from "Vencord";

export default class BDContextMenu {
    static patcher: ContextMenuPatcher;

    static init() {
        this.patcher = new ContextMenuPatcher();

        this.patcher.patch("user-settings-cog", (retVal: any) => {
            const items = retVal.props?.children?.props?.children?.[0];
            if (!items) return;

            items.push(this.patcher.buildItem({ type: "separator" }));
            items.push(this.patcher.buildItem({
                type: "submenu",
                label: "BD Plugins",
                items: this.getPluginMenuItems()
            }));
        });
    }

    static getPluginMenuItems() {
        const items: any[] = [];

        for (const plugin of pluginmanager.addonList) {
            items.push({
                type: "toggle",
                label: plugin.name,
                active: Settings.bdplugins[plugin.id] ?? false,
                action: (e: MouseEvent) => {
                    // BDVencord TODO: Shift+Click for settings
                    pluginmanager.toggle(plugin);
                }
            });
        }

        return items;
    }
}