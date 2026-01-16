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
import { Folder, Check, X, IconNode, FileUp, Store, ChevronRight } from "lucide";
import toasts from "bd/stores/toasts";
import { Card } from "@components/Card";
import { openPluginStore } from "./Store";
import { confirmFileInstall } from "./InstallPopup";

interface ActionButtonProps {
    title: string;
    icon: IconNode;
    onClick: () => void;
}

function StoreCard() {
    return (
        <Card className="bd-store-card" onClick={() => openPluginStore()}>
            <div className="bd-store-card-icon">
                <LucideIcon icon={Store} size="24px" />
            </div>
            <div className="bd-store-card-body">
                <div>Open BetterDiscord plugin store</div>
                <div>Browse official BetterDiscord plugins</div>
            </div>
            <div className="bd-store-card-caret">
                <LucideIcon icon={ChevronRight} size="24px" />
            </div>
        </Card>
    );
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
    );
}

function BDPlugins() {
    const [searchValue, setSearchValue] = useState({ value: "", status: SearchStatus.ALL });
    const plugins = useStateFromStores(pluginmanager, () => pluginmanager.addonList.concat(), [pluginmanager], true);
    const [dragCounter, setDragCounter] = useState(0);

    const onSearch = (query: string) => setSearchValue(prev => ({ ...prev, value: query }));
    const onStatusChange = (status: SearchStatus) => setSearchValue(prev => ({ ...prev, status }));

    const search = searchValue.value.toLowerCase();
    const status = searchValue.status;

    const filteredPlugins = plugins.filter((plugin) => {
        if (status === SearchStatus.ENABLED && !Settings.bdplugins[plugin.id]) return false;
        else if (status === SearchStatus.DISABLED && Settings.bdplugins[plugin.id]) return false;

        if (!search.length) return true;

        return (
            plugin.name.toLowerCase().includes(search) ||
            plugin.description.toLowerCase().includes(search)
        );
    });

    const uploadPlugin = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".plugin.js";
        input.multiple = true;

        input.onchange = () => {
            if (!input.files) return;

            confirmFileInstall(input.files);
        };

        input.click();
    };

    const onDragEnter = () => setDragCounter(c => c + 1);
    const onDragLeave = () => setDragCounter(c => Math.max(0, c - 1));
    const onDragOver = (e: React.DragEvent) => e.preventDefault();
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragCounter(0);

        confirmFileInstall(e.dataTransfer.files);
    };

    return (
        <SettingsTab>
            <Flex>
                <ActionButton title="Open Plugin Folder" icon={Folder} onClick={() => VencordNative.bd.openPluginFolder()} />
                <ActionButton title="Enable All" icon={Check} onClick={() => pluginmanager.enableAll()} />
                <ActionButton title="Disable All" icon={X} onClick={() => pluginmanager.disableAll()} />
                <ActionButton title="Upload Plugin" icon={FileUp} onClick={uploadPlugin} />
            </Flex>

            <StoreCard />

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

            <div
                className={classes(cl("grid"), dragCounter > 0 && "bd-drop-indicator")}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                {filteredPlugins.length
                    ? filteredPlugins.map(plugin => (
                        <BDPluginCard key={plugin.id} plugin={plugin} />
                    )) : (
                        <div className="bd-no-plugins">
                            {plugins.length > 0 ? (
                                <Paragraph>No plugins meet the search criteria.</Paragraph>
                            ) : (
                                <>
                                    <Paragraph>You have no BetterDiscord plugins installed.</Paragraph>
                                    <Paragraph>Use the upload button or drag and drop a .plugin.js file here to install it.</Paragraph>
                                </>
                            )}
                        </div>
                    )
                }
            </div>
        </SettingsTab>
    );
}

export default wrapTab(BDPlugins, "BDPlugins");