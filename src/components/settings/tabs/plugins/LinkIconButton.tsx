/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./LinkIconButton.css";

import { GithubIcon, WebsiteIcon } from "@components/Icons";
import { getTheme, Theme } from "@utils/discord";
import { MaskedLink, Tooltip } from "@webpack/common";
import {LucideIcon} from "bd/ui/icons";
import { CircleQuestionMark, CircleDollarSign, HeartHandshake } from "lucide";

export function DonateLinkIcon() {
    const theme = getTheme() === Theme.Light ? "#000000" : "#FFFFFF";
    return <LucideIcon icon={CircleDollarSign} aria-hidden color={theme} className={"vc-settings-modal-link-icon"} />;
}

export function PatreonLinkIcon() {
    const theme = getTheme() === Theme.Light ? "#000000" : "#FFFFFF";
    return <LucideIcon icon={HeartHandshake} aria-hidden color={theme} className={"vc-settings-modal-link-icon"} />;
}

export function SupportServerIcon() {
    const theme = getTheme() === Theme.Light ? "#000000" : "#FFFFFF";
    return <LucideIcon icon={CircleQuestionMark} aria-hidden color={theme} className={"vc-settings-modal-link-icon"} />;
}

export function GithubLinkIcon() {
    const theme = getTheme() === Theme.Light ? "#000000" : "#FFFFFF";
    return <GithubIcon aria-hidden fill={theme} className={"vc-settings-modal-link-icon"} />;
}

export function WebsiteLinkIcon() {
    const theme = getTheme() === Theme.Light ? "#000000" : "#FFFFFF";
    return <WebsiteIcon aria-hidden fill={theme} className={"vc-settings-modal-link-icon"} />;
}

interface Props {
    text: string;
    href: string;
}

function LinkIcon({ text, href, Icon }: Props & { Icon: React.ComponentType; }) {
    return (
        <Tooltip text={text}>
            {props => (
                <MaskedLink {...props} href={href}>
                    <Icon />
                </MaskedLink>
            )}
        </Tooltip>
    );
}

export const DonateButton = (props: Props) => <LinkIcon {...props} Icon={DonateLinkIcon} />;
export const PatreonButton = (props: Props) => <LinkIcon {...props} Icon={PatreonLinkIcon} />;
export const WebsiteButton = (props: Props) => <LinkIcon {...props} Icon={WebsiteLinkIcon} />;
export const GithubButton = (props: Props) => <LinkIcon {...props} Icon={GithubLinkIcon} />;
