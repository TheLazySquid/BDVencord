import ContextMenuPatcher from "bd/api/contextmenu";
import pluginmanager from "./pluginmanager";
import { openPluginModal } from "@components/settings/tabs/bdplugins/PluginModal";
import { useSettings } from "@api/Settings";
import { openPluginStore } from "@components/settings/tabs/bdplugins/Store";

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
    )

    return items;
}

export function patchSettingsContextMenu() {
    const ContextMenu = new ContextMenuPatcher() as ContextMenuType;

    ContextMenu.patch("user-settings-cog", (retVal: any) => {
        const items = retVal.props?.children?.props?.children?.[0];
        if (!items) return;

        const pluginToggles = usePluginToggles({ ContextMenu });

        items.push(ContextMenu.buildItem({ type: "separator" }));
        items.push(
            <ContextMenu.Item label="BD Plugins" id="bd-plugins">
                <ContextMenu.Group key="bd-plugins-group">
                    {pluginToggles}
                </ContextMenu.Group>
            </ContextMenu.Item>
        );
    });
}