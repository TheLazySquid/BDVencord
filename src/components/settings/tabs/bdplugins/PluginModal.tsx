import "./PluginModal.css";
import { Margins } from "@components/margins";
import { ModalCloseButton, ModalContent, ModalHeader, ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { Forms, React, Text, Tooltip } from "@webpack/common";
import { BDPlugin } from "bd/core/pluginmanager";
import { Flex } from "@components/Flex";
import { classes } from "@utils/misc";
import type { RefObject } from "react";
import ErrorBoundary from "@components/ErrorBoundary";
import { DonateButton, GithubButton, PatreonButton, SupportServerIcon, WebsiteButton } from "../plugins/LinkIconButton";
import { classNameFactory } from "@utils/css";
import Modals from "bd/ui/modals";

const cl = classNameFactory("vc-plugin-modal-");

interface BDPluginModalProps extends ModalProps {
    plugin: BDPlugin;
    enabled: boolean;
}

function BDPluginModal({ plugin, enabled, onClose, transitionState }: BDPluginModalProps) {
    const getSettings = () => {
        if (!enabled) return <Forms.FormText>Plugins need to be enabled to access their settings.</Forms.FormText>;

        const Panel = plugin.instance?.getSettingsPanel?.();
        if (!Panel) return <Forms.FormText>There are no settings for this plugin.</Forms.FormText>;

        if (Panel instanceof Node || typeof Panel === "string") {
            class Wrapper extends React.Component<any, { hasError: boolean; }> {
                element: Element | string;
                elementRef: RefObject<Element | string | null>;
                constructor(props?: any) {
                    super(props);
                    this.elementRef = React.createRef();
                    this.element = Panel as (Element | string);
                    this.state = { hasError: false };
                }

                componentDidCatch() {
                    this.setState({ hasError: true });
                }

                componentDidMount() {
                    if (this.element instanceof Node) (this.elementRef as RefObject<Element>).current?.appendChild(this.element as Element);
                }

                render() {
                    if (this.state.hasError) return <Forms.FormText>Failed to load settings panel.</Forms.FormText>;
                    return React.createElement("div", {
                        className: "bd-addon-settings-wrap",
                        ref: this.elementRef,
                        dangerouslySetInnerHTML: typeof (this.element) === "string" ? { __html: this.element } : undefined
                    });
                }
            }

            return <Wrapper />;
        }

        if (typeof Panel === "function") return <Panel />;
        return Panel;
    };

    return (
        <ModalRoot size={ModalSize.MEDIUM} transitionState={transitionState}>
            <ModalHeader separator={false} className={Margins.bottom8}>
                <Text variant="heading-xl/bold" style={{ flexGrow: 1 }}>{plugin.name} v{plugin.version}</Text>
                <ModalCloseButton onClick={onClose} />
            </ModalHeader>

            <ModalContent className={Margins.bottom16}>
                <section>
                    <Flex className={cl("info")}>
                        <Forms.FormText className={cl("description")}>{plugin.description}</Forms.FormText>
                        <div className="vc-settings-modal-links">
                            {plugin.patreon && (
                                <PatreonButton
                                    text="Support the author on Patreon"
                                    href={plugin.patreon}
                                />
                            )}
                            {plugin.donate && (
                                <DonateButton
                                    text="Support the author"
                                    href={plugin.donate}
                                />
                            )}
                            {plugin.invite && (
                                <Tooltip text="Join support server">
                                    {props => (
                                        <button
                                            {...props}
                                            className="join-support-server"
                                            onClick={() => Modals.showGuildJoinModal(plugin.invite!)}
                                        >
                                            <SupportServerIcon />
                                        </button>
                                    )}
                                </Tooltip>
                            )}
                            {plugin.website && (
                                <WebsiteButton
                                    text="View more info"
                                    href={plugin.website}
                                />
                            )}
                            {plugin.source && (
                                <GithubButton
                                    text="View source code"
                                    href={plugin.source}
                                />
                            )}
                        </div>
                    </Flex>
                    <Text variant="heading-lg/semibold" className={classes(Margins.top8, Margins.bottom8)}>Author</Text>
                    <Text>{plugin.author}</Text>
                </section>

                <section>
                    <Text variant="heading-lg/semibold" className={classes(Margins.top16, Margins.bottom8)}>Settings</Text>
                    <ErrorBoundary noop>
                        {getSettings()}
                    </ErrorBoundary>
                </section>
            </ModalContent>
        </ModalRoot>
    );
}

export function openPluginModal(plugin: BDPlugin, enabled: boolean) {
    openModal(modalProps => (
        <BDPluginModal
            {...modalProps}
            plugin={plugin}
            enabled={enabled}
        />
    ));
}