import { BdWebAddon } from "bd/types/addonstore";
import DiscordModules from "bd/webpack/modules";
import { LucideIcon } from "bd/ui/icons";
import { BadgeCheck, CircleHelp, Github, Globe, Trash2 } from "lucide";
import Button from "bd/ui/base/button";
import Modals from "bd/ui/modals";
import { useState } from "@webpack/common";
import pluginmanager from "bd/core/pluginmanager";
import { confirmWebInstall } from "./InstallPopup";

interface Props {
    plugin: BdWebAddon;
}

const baseUrl = "https://betterdiscord.app";

const resolveThumbnail = (url?: string) => {
    if (url) return baseUrl + url;
    return baseUrl + "/resources/store/missing.svg";
};

const resolveAvatar = (githubId: string) => {
    return `https://avatars.githubusercontent.com/u/${githubId}?v=4`;
};

const openUrl = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

const openAuthorPage = (author: string) => {
    openUrl(baseUrl + "/developer/" + encodeURIComponent(author));
};

const openAddonPage = (id: number) => {
    openUrl(baseUrl + "/plugin?id=" + id);
};

const RAW_GIT_URL_REGEX = /^https:\/\/raw\.githubusercontent\.com\/(.+?)\/(.+?)\/(.+?)\/(.+)$/;
const openSourceCode = (rawUrl: string) => {
    const match = rawUrl.match(RAW_GIT_URL_REGEX);
    if (!match) {
        window.open(rawUrl, "_blank", "noopener,noreferrer");
        return;
    }

    const [, user, repo, commit, filePath] = match;
    openUrl(`https://github.com/${user}/${repo}/blob/${commit}/${filePath}`);
};

export default function PluginStoreCard({ plugin }: Props) {
    const existingPlugin = pluginmanager.getPlugin(plugin.file_name);
    const [isInstalled, setInstalled] = useState(existingPlugin !== undefined);
    const [disabled, setDisabled] = useState(false);

    const deletePlugin = () => {
        Modals.showConfirmationModal("Deletion confirmation", `Are you sure you want to delete ${plugin.name}?`, {
            onConfirm: () => {
                if (!existingPlugin) return;
                pluginmanager.deletePlugin(existingPlugin, true);
                setInstalled(false);
            }
        });
    };

    const installPlugin = async () => {
        setDisabled(true);
        await confirmWebInstall(plugin);
        setInstalled(true);
        setDisabled(false);
    };

    return (
        <div className="bd-addon-store-card">
            <div className="bd-addon-store-card-splash">
                <div className="bd-addon-store-card-preview">
                    <img
                        src={resolveThumbnail(plugin.thumbnail_url)}
                        onError={(event) => {
                            // Fallback to blank thumbnail
                            event.currentTarget.src = resolveThumbnail();
                        }}
                        loading="lazy"
                        className="bd-addon-store-card-preview-img"
                        alt={`Thumbnail for ${plugin.name}`}
                    />
                </div>
                <div className="bd-addon-store-card-author">
                    <svg
                        height={48}
                        width={48}
                        className="bd-addon-store-card-author-svg"
                        viewBox="0 0 48 48"
                    >
                        <foreignObject
                            x={0}
                            y={0}
                            height={48}
                            width={48}
                            overflow="visible"
                            mask="url(#svg-mask-squircle)"
                        >
                            <div className="bd-addon-store-card-author-mask">
                                <svg
                                    height={40}
                                    width={40}
                                    className="bd-addon-store-card-author-svg"
                                    viewBox="0 0 40 40"
                                >
                                    <foreignObject
                                        x={0}
                                        y={0}
                                        height={40}
                                        width={40}
                                        overflow="visible"
                                        mask="url(#svg-mask-squircle)"
                                    >
                                        <DiscordModules.Tooltip text={plugin.author.display_name}>
                                            {(props) => (
                                                <img
                                                    loading="lazy"
                                                    className="bd-addon-store-card-author-img"
                                                    src={resolveAvatar(plugin.author.github_id)}
                                                    {...props}
                                                    onClick={() => openAuthorPage(plugin.author.display_name)}
                                                />
                                            )}
                                        </DiscordModules.Tooltip>
                                    </foreignObject>
                                </svg>
                            </div>
                        </foreignObject>
                    </svg>
                </div>
                {/* BDVencord TODO: New / Recently updated */}
            </div>
            <div className="bd-addon-store-card-body">
                <div className="bd-addon-store-card-name">
                    {/* @ts-expect-error bd */}
                    <DiscordModules.Tooltip text="Official" aria-label="Official" hideOnClick={false}>
                        {(props) => (
                            <div className="bd-flower-star" {...props}>
                                <LucideIcon icon={BadgeCheck} size={16} />
                            </div>
                        )}
                    </DiscordModules.Tooltip>
                    <span>{plugin.name}</span>
                </div>
                <div className="bd-addon-store-card-description">{plugin.description}</div>
                <div className="bd-addon-store-card-tags">
                    {plugin.tags.map((tag) => (
                        <span
                            className="bd-addon-store-card-tag"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="bd-addon-store-card-spacer" />
                <div className="bd-addon-store-card-info">
                    <div className="bd-addon-store-card-likes">
                        <div className="bd-addon-store-card-dot" />
                        <div className="bd-addon-store-card-value">{plugin.likes}</div>
                    </div>
                    <div className="bd-addon-store-card-downloads">
                        <div className="bd-addon-store-card-dot" />
                        <div className="bd-addon-store-card-value">{plugin.downloads}</div>
                    </div>
                </div>
                <div className="bd-addon-store-card-actions">
                    <DiscordModules.Tooltip text="Website">
                        {(props) => (
                            <Button
                                {...props}
                                size={Button.Sizes.ICON}
                                look={Button.Looks.BLANK}
                                onClick={() => openAddonPage(plugin.id)}
                            >
                                <LucideIcon icon={Globe} size={20} />
                            </Button>
                        )}
                    </DiscordModules.Tooltip>
                    <DiscordModules.Tooltip text="Source">
                        {(props) => (
                            <Button
                                {...props}
                                size={Button.Sizes.ICON}
                                look={Button.Looks.BLANK}
                                onClick={() => openSourceCode(plugin.latest_source_url)}
                            >
                                <LucideIcon icon={Github} size="20px" />
                            </Button>
                        )}
                    </DiscordModules.Tooltip>
                    {plugin.guild && (
                        <DiscordModules.Tooltip text="Support Server">
                            {(props) => (
                                <Button
                                    {...props}
                                    size={Button.Sizes.ICON}
                                    look={Button.Looks.BLANK}
                                    onClick={() => Modals.showGuildJoinModal(plugin.guild!.invite_link)}
                                >
                                    <LucideIcon icon={CircleHelp} size="20px" />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    )}
                    <div className="bd-addon-store-card-spacer" />
                    {isInstalled ? (
                        <DiscordModules.Tooltip text="Delete">
                            {(props) => (
                                <Button
                                    {...props}
                                    onClick={deletePlugin}
                                    color={Button.Colors.RED}
                                    size={Button.Sizes.ICON}
                                >
                                    <LucideIcon icon={Trash2} size="20px" />
                                </Button>
                            )}
                        </DiscordModules.Tooltip>
                    ) : (
                        <Button onClick={installPlugin} disabled={disabled}>
                            Download
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}