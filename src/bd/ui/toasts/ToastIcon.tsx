import { React } from "@webpack/common";
import type { ToastType } from "../toasts";
import {LucideIcon} from "bd/ui/icons";
import {Info, CircleCheck, TriangleAlert, CircleAlert} from "lucide";

export default function ToastIcon({ type }: { type: ToastType; }) {
    switch (type) {
        case "info":
            return <LucideIcon icon={Info} size={24} />;
        case "success":
            return <LucideIcon icon={CircleCheck} size={24} />;
        case "warning":
            return <LucideIcon icon={TriangleAlert} size={24} />;
        case "error":
            return <LucideIcon icon={CircleAlert} size={24} />;
        default:
            return null;
    }
}