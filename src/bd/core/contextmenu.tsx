import ContextMenuPatcher from "bd/api/contextmenu";
import pluginmanager from "./pluginmanager";
import { openPluginModal } from "@components/settings/tabs/bdplugins/PluginModal";
import { useSettings } from "@api/Settings";
import { openPluginStore } from "@components/settings/tabs/bdplugins/Store";
import findInTree from "bd/utils/findintree";

type ContextMenuType = ContextMenuPatcher & {
    Separator: any;
    CheckboxItem: any;
    RadioItem: any;
    ControlItem: any;
    Group: any;
    Item: any;
    Menu: any;
};

function usePluginToggles({ ContextMenu }: { ContextMenu: ContextMenuType; }) {
    const settings = useSettings([`bdplugins.*`]);

    const items = pluginmanager.addonList.map((plugin) => (
        <ContextMenu.CheckboxItem
            label={plugin.name}
            id={`plugin-${plugin.id}`}
            key={`plugin-${plugin.id}`}
            checked={settings.bdplugins[plugin.id] ?? false}
            action={(e: MouseEvent) => {
                if (!e.shiftKey) {
                    pluginmanager.toggle(plugin);
                    return;
                }

                e.preventDefault();
                if (!settings.bdplugins[plugin.id] || !plugin.instance?.getSettingsPanel) return;
                openPluginModal(plugin, true);
                ContextMenu.close();
            }}
        />
    ));

    items.push(
        <ContextMenu.Item
            label="View plugin store"
            id="no-plugins"
            key="no-plugins"
            action={openPluginStore}
        />
    );

    return items;
}

export function patchSettingsContextMenu() {
    const ContextMenu = new ContextMenuPatcher() as ContextMenuType;

    ContextMenu.patch("settings-menu", (retVal: any) => {
        const element = findInTree(retVal, (e) => e.key === "bd_plugins", { walkable: ["props", "children"] });
        if (!element) return;

        const pluginToggles = usePluginToggles({ ContextMenu });

        element.props.children = (
            <ContextMenu.Group key="bd-plugins-group">
                {pluginToggles}
            </ContextMenu.Group>
        );
    });
}