import { AddonCard } from "@components/settings/AddonCard";
import type { BDPlugin } from "bd/core/pluginmanager";
import { cl } from "../plugins";
import { CogWheel, DeleteIcon, InfoIcon } from "@components/Icons";
import { openPluginModal } from "./PluginModal";
import { Settings } from "Vencord";
import { useState } from "@webpack/common";
import pluginmanager from "bd/core/pluginmanager";
import Modals from "bd/ui/modals";

export default function BDPluginCard({ plugin }: { plugin: BDPlugin; }) {
    const [enabled, setEnabled] = useState(Settings.bdplugins[plugin.id] ?? false);

    const trySetEnabled = (enabled: boolean) => {
        if(enabled) {
            const success = pluginmanager.startPlugin(plugin);
            if(!success) return;
        } else {
            pluginmanager.stopPlugin(plugin);
        }

        setEnabled(enabled);
        Settings.bdplugins[plugin.id] = enabled;
    }

    const deletePlugin = () => {
        Modals.showConfirmationModal("Deletion confirmation", `Are you sure you want to delete ${plugin.name}?`, {
            onConfirm: () => pluginmanager.deletePlugin(plugin)
        });
    }

    return (
        <AddonCard
            name={plugin.name}
            description={plugin.description}
            enabled={enabled}
            setEnabled={trySetEnabled}
            infoButton={
                <>
                    <button
                        onClick={() => deletePlugin()}
                        className={cl("info-button")}
                    >
                        <DeleteIcon className={cl("info-icon")} />
                    </button>
                    <button
                        role="switch"
                        onClick={() => openPluginModal(plugin, enabled)}
                        className={cl("info-button")}
                    >
                        {plugin?.instance?.getSettingsPanel && enabled
                            ? <CogWheel className={cl("info-icon")} />
                            : <InfoIcon className={cl("info-icon")} />
                        }
                    </button>
                </>
            }
        />
    );
}