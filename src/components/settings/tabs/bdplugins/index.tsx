import "./index.css";
import { HeadingTertiary } from "@components/Heading";
import { SettingsTab, wrapTab } from "../BaseTab";
import ErrorBoundary from "@components/ErrorBoundary";
import { Select, TextInput, useState } from "@webpack/common";
import { classes } from "@utils/misc";
import { Margins } from "@components/margins";
import { cl, SearchStatus } from "../plugins";
import { isTruthy } from "@utils/guards";
import { Paragraph } from "@components/Paragraph";
import pluginmanager from "bd/core/pluginmanager";
import BDPluginCard from "./PluginCard";
import { Settings } from "Vencord";
import { useStateFromStores } from "bd/ui/hooks";
import DiscordModules from "bd/webpack/modules";
import { Flex } from "@components/Flex";
import { LucideIcon } from "bd/ui/icons";
import { Folder, Check, X, IconNode } from "lucide";

interface ActionButtonProps {
    title: string;
    icon: IconNode;
    onClick: () => void;
}

function ActionButton({ title, icon, onClick }: ActionButtonProps) {
    return (
        <DiscordModules.Tooltip color="primary" position="top" aria-label={title} text={title}>
            {(props) => (
                <button {...props} onClick={onClick} className="bd-action-button">
                    <LucideIcon icon={icon} size={18} color="white" />
                </button>
            )}
        </DiscordModules.Tooltip>
    )
}

function BDPlugins() {
    const [searchValue, setSearchValue] = useState({ value: "", status: SearchStatus.ALL });
    const plugins = useStateFromStores(pluginmanager, () => pluginmanager.addonList.concat(), [pluginmanager], true);

    const onSearch = (query: string) => setSearchValue(prev => ({ ...prev, value: query }));
    const onStatusChange = (status: SearchStatus) => setSearchValue(prev => ({ ...prev, status }));

    const search = searchValue.value.toLowerCase();
    const status = searchValue.status;

    const filteredPlugins = plugins.filter((plugin) => {
        if(status === SearchStatus.ENABLED && !Settings.bdplugins[plugin.id]) return false;
        else if(status === SearchStatus.DISABLED && Settings.bdplugins[plugin.id]) return false;

        if(!search.length) return true;

        return (
            plugin.name.toLowerCase().includes(search) ||
            plugin.description.toLowerCase().includes(search)
        );
    });

    return (
        <SettingsTab>
            <Flex>
                <ActionButton title="Open Plugin Folder" icon={Folder} onClick={() => VencordNative.bd.openPluginFolder()} />
                <ActionButton title="Enable All" icon={Check} onClick={() => pluginmanager.enableAll()} />
                <ActionButton title="Disable All" icon={X} onClick={() => pluginmanager.disableAll()} />
            </Flex>

            <HeadingTertiary className={classes(Margins.top20, Margins.bottom8)}>
                Filters
            </HeadingTertiary>

            <div className={classes(Margins.bottom20, cl("filter-controls"))}>
                <ErrorBoundary noop>
                    <TextInput autoFocus value={searchValue.value} placeholder="Search for a plugin..." onChange={onSearch} />
                </ErrorBoundary>
                <div>
                    <ErrorBoundary noop>
                        <Select
                            options={[
                                { label: "Show All", value: SearchStatus.ALL, default: true },
                                { label: "Show Enabled", value: SearchStatus.ENABLED },
                                { label: "Show Disabled", value: SearchStatus.DISABLED }
                            ].filter(isTruthy)}
                            serialize={String}
                            select={onStatusChange}
                            isSelected={v => v === searchValue.status}
                            closeOnSelect={true}
                        />
                    </ErrorBoundary>
                </div>
            </div>

            <HeadingTertiary className={Margins.top20}>Plugins</HeadingTertiary>

            <div className={cl("grid")}>
                {filteredPlugins.length
                    ? filteredPlugins.map(plugin => (
                        <BDPluginCard key={plugin.id} plugin={plugin} />
                    )) : <Paragraph>No plugins meet the search criteria.</Paragraph>
                }
            </div>
        </SettingsTab>
    );
}

export default wrapTab(BDPlugins, "BDPlugins");