import { React } from "@webpack/common";
import type { ToastType } from "../toasts";
import { InfoIcon, CircleAlertIcon, CircleCheckIcon, TriangleAlertIcon } from "../icons";

export default function ToastIcon({ type }: { type: ToastType; }) {
    switch (type) {
        case "info":
            return <InfoIcon size={24} />;
        case "success":
            return <CircleCheckIcon size={24} />;
        case "warning":
            return <TriangleAlertIcon size={24} />;
        case "error":
            return <CircleAlertIcon size={24} />;
        default:
            return null;
    }
}