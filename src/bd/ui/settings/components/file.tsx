import { React } from "@webpack/common";
import Remote from "bd/polyfill/remote";
import Button from "bd/ui/base/button";
import {LucideIcon} from "bd/ui/icons";
import {X} from "lucide";
import type { ChangeEvent } from "react";


export interface BaseFilepickerProp {
    multiple?: boolean;
    accept?: string;
    clearable?: boolean;
    onChange?(newValue: string[] | string): void;
    disabled?: boolean;
    actions?: {
        clear?(): void;
    };
}

export interface SingleFilepickerProp extends BaseFilepickerProp {
    multiple: true;
    onChange?(newValue: string[]): void;
}

export interface MultipleFilepickerProp extends BaseFilepickerProp {
    multiple?: false;
    onChange?(newValue: string): void;
}

export default function Filepicker({ multiple, accept, clearable, onChange, disabled, actions }: SingleFilepickerProp | MultipleFilepickerProp) {
    const { useRef, useCallback, useEffect } = React;

    const inputRef = useRef<HTMLInputElement>(null);

    const change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const files: string[] = [];
        for (const file of e.target.files!) {
            files.push(Remote.electron.webUtils.getPathForFile(file));
        }
        if (multiple === true) onChange?.(files);
        else onChange?.(files[0]);
    }, [onChange, disabled, multiple]);

    const clear = useCallback(() => {
        inputRef.current!.value = "";
        if (multiple === true) onChange?.([]);
        else onChange?.("");
    }, [onChange, multiple]);

    useEffect(() => {
        if (!actions) return;
        actions.clear = clear;
    }, [clear, actions]);

    const onClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    return <div className={`bd-file-input-wrap ${disabled ? "bd-file-input-disabled" : ""}`}>
        <Button size={Button.Sizes.ICON} look={Button.Looks.FILLED} color={Button.Colors.PRIMARY} className="bd-file-input-browse" onClick={onClick}>Browse</Button>
        <input onChange={change} type="file" className="bd-file-input" multiple={multiple} accept={accept} disabled={disabled} ref={inputRef} />
        {clearable && <Button size={Button.Sizes.ICON} look={Button.Looks.BLANK} onClick={clear} className="bd-file-input-clear"><LucideIcon icon={X} size={24} /></Button>}
    </div>;
}