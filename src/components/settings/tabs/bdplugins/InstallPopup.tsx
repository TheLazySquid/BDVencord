import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { classes } from "@utils/misc";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { React, Text } from "@webpack/common";
import pluginmanager, { PluginMeta } from "bd/core/pluginmanager";
import toasts from "bd/stores/toasts";
import { BdWebAddon } from "bd/types/addonstore";
import Button from "bd/ui/base/button";
import { LucideIcon } from "bd/ui/icons";
import CheckBox from "bd/ui/settings/components/checkbox";
import { parseJSDoc } from "bd/utils/jsdoc";
import { Github, IconNode, Info, Tag, User } from "lucide";

interface PopupProps {
    icon: IconNode;
    content: string;
    onClick?: () => void;
}

function PopupItem({ icon, content, onClick }: PopupProps) {
    return (
        <Flex
            onClick={onClick}
            className={classes("bd-install-modal-item", onClick && "bd-install-modal-clickable")}
            alignItems="center"
        >
            <div className="bd-install-modal-item-leading"><LucideIcon icon={icon} /></div>
            <div className="bd-install-modal-item-content">{content}</div>
        </Flex>
    );
}

interface InstallProps {
    filename: string;
    name: string;
    description: string;
    author: string;
    version: string;
    source?: string;
    onConfirm: (enable: boolean) => void;
    onCancel: () => void;
}

const openUrl = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
const RAW_GIT_URL_REGEX = /^https:\/\/raw\.githubusercontent\.com\/(.+?)\/(.+?)\/(.+?)\/(.+)$/;

function InstallPopup(props: InstallProps & ModalProps) {
    const [enable, setEnable] = React.useState(true);

    const install = () => {
        props.onConfirm(enable);
        props.onClose();
    }

    const openSource = () => {
        if(!props.source) return;
        
        const match = props.source.match(RAW_GIT_URL_REGEX);
        if (!match) {
            window.open(props.source, "_blank", "noopener,noreferrer");
            return;
        }

        const [, user, repo, commit, filePath] = match;
        openUrl(`https://github.com/${user}/${repo}/blob/${commit}/${filePath}`);
    };

    return (
        <ModalRoot size={ModalSize.MEDIUM} transitionState={props.transitionState}>
            <ModalHeader separator={false} className={Margins.bottom8}>
                <Text variant="heading-xl/bold" style={{ flexGrow: 1 }}>{props.name} Installation</Text>
                <ModalCloseButton onClick={props.onClose} />
            </ModalHeader>

            <ModalContent className={Margins.bottom16}>
                <div className="bd-install-modal-items">
                    <PopupItem icon={Info} content={props.description} />
                    <PopupItem icon={Tag} content={props.version} />
                    {props.source && <PopupItem icon={Github} content={props.filename} onClick={openSource} />}
                    <PopupItem icon={User} content={props.author} />
                </div>
            </ModalContent>

            <ModalFooter>
                <Flex alignItems="center">
                    <CheckBox
                        value={enable}
                        onChange={() => setEnable(!enable)}
                        label={<Text>Enable after installation</Text>}
                    />
                    <Button onClick={install}>Install</Button>
                </Flex>
            </ModalFooter>
        </ModalRoot>
    );
}

export function openInstallPopup(props: InstallProps) {
    openModal(modalProps => (
        <InstallPopup {...props} {...modalProps} />
    ), {
        onCloseCallback: props.onCancel
    });
}

export async function confirmWebInstall(plugin: BdWebAddon) {
    const create = async (enable: boolean) => {
        const res = await fetch(plugin.latest_source_url);
        const code = await res.text();

        pluginmanager.createPlugin({
            added: Date.now(),
            modified: Date.now(),
            code,
            file: plugin.file_name,
            size: code.length // Approximately
        }, enable, true);
    }

    await new Promise<void>((res) => {
        openInstallPopup({
            filename: plugin.file_name,
            author: plugin.author.discord_name,
            version: plugin.version,
            description: plugin.description,
            name: plugin.name,
            source: plugin.latest_source_url,
            onCancel: () => res(),
            onConfirm: (enable) => {
                create(enable);
                res();
            }
        });
    });
}

export async function confirmFileInstall(fileList: FileList) {
    // Filter out non-plugin files
    const files = Array.from(fileList).filter(f => f.name.endsWith(".plugin.js"));

    for (const file of fileList) {
        if (!file.name.endsWith(".plugin.js")) {
            toasts.show(`${file.name} is not a valid BetterDiscord plugin`, { type: "error" });
        }
    }

    if (files.length === 0) return;

    // Show a confirmation popup for each plugin
    for (const file of files) {
        // Get the plugin's metadata
        const code = await file.text();
        const newlineIndex = code.indexOf("\n");
        const firstLine = code.slice(0, newlineIndex);
        if (!firstLine.includes("/**")) {
            toasts.show(`${file.name} is not a valid BetterDiscord plugin`, { type: "error" });
            return;
        }

        const meta = parseJSDoc(code) as Partial<PluginMeta>;

        const create = (enable: boolean) => {
            pluginmanager.createPlugin({
                added: Date.now(),
                modified: Date.now(),
                code,
                file: file.name,
                size: file.size
            }, enable, true);
        }

        await new Promise<void>((res) => {
            openInstallPopup({
                filename: file.name,
                author: meta.author ?? "Unknown",
                version: meta.version ?? "???",
                description: meta.description ?? "Description not provided.",
                name: meta.name ?? file.name,
                source: meta.source,
                onCancel: () => res(),
                onConfirm: (enable) => {
                    create(enable);
                    res();
                }
            });
        });
    }
}