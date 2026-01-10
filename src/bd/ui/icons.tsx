import type { PropsWithChildren } from "react";
import { React } from "@webpack/common";

interface IconOptions {
    size?: number | string;
    color?: string;
    className?: string;
}

function Icon({ size = 24, color, children, className }: PropsWithChildren<IconOptions>) {
    const stroke = color ?? "currentColor";

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={className}>
            {children}
        </svg>
    );
}

export function InfoIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </Icon>
    );
}

export function CircleCheckIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </Icon>
    );
}

export function TriangleAlertIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </Icon>
    );
}

export function CircleAlertIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </Icon>
    );
}

export function CheckIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <path d="M20 6 9 17l-5-5" />
        </Icon>
    );
}

export function PipetteIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12" />
            <path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z" />
            <path d="m2 22 .414-.414" />
        </Icon>
    );
}

export function ChevronDownIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <path d="m6 9 6 6 6-6" />
        </Icon>
    );
}

export function XIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </Icon>
    );
}

export function KeyboardIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <path d="M10 8h.01" />
            <path d="M12 12h.01" />
            <path d="M14 8h.01" />
            <path d="M16 12h.01" />
            <path d="M18 8h.01" />
            <path d="M6 8h.01" />
            <path d="M7 16h10" />
            <path d="M8 12h.01" />
            <rect width="20" height="16" x="2" y="4" rx="2" />
        </Icon>
    );
}

export function PlusIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </Icon>
    );
}

export function MinusIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <path d="M5 12h14" />
        </Icon>
    );
}

export function SearchIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <path d="m21 21-4.34-4.34" />
            <circle cx="11" cy="11" r="8" />
        </Icon>
    );
}

export function HeartHandshakeIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <path d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762" />
        </Icon>
    );
}

export function CircleDollarSignIcon(options: IconOptions) {
    return (
        <Icon {...options}>
            <circle cx="12" cy="12" r="10" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
            <path d="M12 18V6" />
        </Icon>
    );
}

export function CircleQuestionMark(options: IconOptions) {
    return (
        <Icon {...options}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
        </Icon>
    );
}
