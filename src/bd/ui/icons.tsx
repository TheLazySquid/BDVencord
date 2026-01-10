import { React } from "@webpack/common";
import type { IconNode } from "lucide";

interface IconOptions {
    icon: IconNode;
    size?: number | string;
    color?: string;
    className?: string;
}

export function LucideIcon({ icon, size = 24, color, className }: IconOptions) {
    const stroke = color ?? "currentColor";

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={className}>
            {icon.map(([tag, attrs]) => React.createElement(tag, attrs))}
        </svg>
    );
}
