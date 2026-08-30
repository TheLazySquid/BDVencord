import { React } from "@webpack/common";
import Button from "@bd/ui/base/button";
import { LucideIcon } from "@bd/ui/icons";
import { Keyboard, X } from "lucide";
import { useItemProps, type BaseSettingProps } from "./utils";
import { useCallbackRef } from "@bd/ui/hooks";

interface BaseKeybindProps {
    onChange?(newValue: string[]): void;
    max?: number;
    clearable?: boolean;
    disabled?: boolean;
}

export type KeybindProps = BaseKeybindProps & BaseSettingProps<string[]>;

export default function Keybind(props: KeybindProps) {
    const { useRef, useCallback, useEffect, useState } = React;

    const { max = 4, clearable = false } = props;
    const { state, setState, disabled } = useItemProps<string[]>(props);

    const [isRecording, setRecording] = useState(false);
    const accum = useRef<string[]>([]);

    const dispatch = useCallback(() => {
        setRecording(false);

        try {
            setState(accum.current.concat());
        }
        finally {
            accum.current.length = 0;
        }
    }, [setState]);

    const keyDownHandler = useCallbackRef((event: KeyboardEvent) => {
        if (!isRecording) return;

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        if (event.repeat || accum.current.includes(event.key)) return;

        accum.current.push(event.key);

        if (accum.current.length >= max) dispatch();
    });

    const keyUpHandler = useCallbackRef((event: KeyboardEvent) => {
        if (!isRecording) return;

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        if (event.key === accum.current[0]) dispatch();
    });

    useEffect(() => {
        window.addEventListener("keydown", keyDownHandler, true);
        window.addEventListener("keyup", keyUpHandler, true);

        return () => {
            window.removeEventListener("keydown", keyDownHandler, true);
            window.removeEventListener("keyup", keyUpHandler, true);
        };
    }, [keyDownHandler, keyUpHandler]);

    const clearKeybind = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        if (disabled) return;

        dispatch();
    }, [disabled, dispatch]);

    const onClick = useCallback((e: React.MouseEvent) => {
        if (disabled) return;
        if (e.currentTarget?.className?.includes?.("bd-keybind-clear") || e.currentTarget?.closest(".bd-button")?.className?.includes("bd-keybind-clear")) return clearKeybind(e);

        accum.current.length = 0;
        setRecording(v => !v);
    }, [disabled, clearKeybind]);

    const displayValue = !state.length ? "" : state.map(k => k === "Control" ? "Ctrl" : k).join(" + ");
    return (
        <div className={"bd-keybind-wrap" + (isRecording ? " recording" : "") + (disabled ? " bd-keybind-disabled" : "")} onClick={onClick}>
            <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={isRecording ? Button.Colors.RED : Button.Colors.PRIMARY} className="bd-keybind-record" onClick={onClick}>
                <LucideIcon icon={Keyboard} size={24} />
            </Button>

            <input readOnly={true} type="text" className="bd-keybind-input" value={displayValue} placeholder="No keybind set" disabled={disabled} />

            {clearable && (
                <Button size={Button.Sizes.ICON} look={Button.Looks.BLANK} onClick={clearKeybind} className="bd-keybind-clear">
                    <LucideIcon icon={X} size={24} />
                </Button>
            )}
        </div>
    );
}