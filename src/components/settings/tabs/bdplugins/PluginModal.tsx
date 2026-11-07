import "./PluginModal.css";
import { Margins } from "@components/margins";
import { React, Tooltip, Modal, openModal } from "@webpack/common";
import { BDPlugin } from "@bd/core/pluginmanager";
import { Flex } from "@components/Flex";
import { classes } from "@utils/misc";
import type { RefObject } from "react";
import ErrorBoundary from "@components/ErrorBoundary";
import { DonateButton, GithubButton, PatreonButton, SupportServerIcon, WebsiteButton } from "../plugins/LinkIconButton";
import { classNameFactory } from "@utils/css";
import Modals from "@bd/ui/modals";
import { RenderModalProps } from "@vencord/discord-types";
import { Heading } from "@components/Heading";
import { Paragraph } from "@components/Paragraph";

const cl = classNameFactory("vc-plugin-modal-");

interface BDPluginModalProps extends RenderModalProps {
    plugin: BDPlugin;
    enabled: boolean;
    Panel: any;
}

function BDPluginModal({ plugin, enabled, onClose, transitionState, Panel }: BDPluginModalProps) {
    const getSettings = () => {
        if (!enabled) return <Paragraph>Plugins need to be enabled to access their settings.</Paragraph>;
        if (!Panel) return <Paragraph>There are no settings for this plugin.</Paragraph>;

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
                    if (this.state.hasError) return <Paragraph>Failed to load settings panel.</Paragraph>;
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
        <Modal
            transitionState={transitionState}
            onClose={onClose}
            size="lg"
            title={
                <Heading tag="h1" weight="semibold" size="lg">{plugin.name} v{plugin.version}</Heading>
            }
        >
            <div className={"vc-settings-modal-content"}>
                <section>
                    <Flex className={cl("info")}>
                        <Paragraph className={cl("description")}>{plugin.description}</Paragraph>
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
                    <Heading tag="h3" className={classes(Margins.top8, Margins.bottom8)}>Author</Heading>
                    <div>{plugin.author}</div>
                </section>

                <section className="bd-plugin-settings">
                    <Heading tag="h3" className={classes(Margins.top16, Margins.bottom8)}>Settings</Heading>
                    <ErrorBoundary noop>
                        {getSettings()}
                    </ErrorBoundary>
                </section>
            </div>
        </Modal>
    );
}

export function openPluginModal(plugin: BDPlugin, enabled: boolean) {
    let Panel: any;

    // DevilBro plugins have the getSettingsPanel method open his own modal
    // And things start to break if we have the default modal and his together
    if(typeof plugin.instance?.getSettingsPanel === "function") {
        Panel = plugin.instance.getSettingsPanel();
        if(!Panel) return;
    }

    openModal(modalProps => (
        <BDPluginModal
            {...modalProps}
            Panel={Panel}
            plugin={plugin}
            enabled={enabled}
        />
    ));
}