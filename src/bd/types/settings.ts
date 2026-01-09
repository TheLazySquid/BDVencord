export type SettingType = "button" | "custom" | "switch" | "dropdown" | "switch" | "slider" | "color" | "text" | "position" | "radio" | "file" | "keybind" | "number";

export interface SettingItem {
    type: SettingType;
    id: string;
    value: unknown;
    name?: string;
    note?: string;
    disabled?: boolean;
    enableWith?: string;
    disableWith?: string;
    defaultValue?: unknown;
    inline?: boolean;
    hidden?: boolean;
}

export interface SwitchSetting extends SettingItem {
    type: "switch";
    value: boolean;
}

export interface DropdownSetting<T> extends SettingItem {
    type: "dropdown";
    value: T;
    options: Array<{id?: string; label: string; value: T;}>;
    style?: "transparent" | "default";
}

export interface SliderSetting extends SettingItem {
    type: "slider";
    value: number;
    min: number;
    max: number;
    step?: number;
    units: string;
    markers: Array<(number | {label: string; value: number;})>;
}

export interface TextSetting extends SettingItem {
    type: "text";
    value: string;
    placeholder?: string;
    maxLength?: number;
}

export interface RadioSetting<T> extends SettingItem {
    type: "radio";
    value: T;
    options: Array<{name: string, value: T, description: string;}>;
}

export interface KeybindSetting extends SettingItem {
    type: "keybind";
    value: string[];
    clearable?: boolean;
    max?: number;
}

type HexString = `#${string}`;
type Color = HexString | number;
export interface ColorSetting extends SettingItem {
    type: "color";
    value: Color;
    defaultValue?: Color;
    colors?: Color[];
}

export interface PositionSetting extends SettingItem {
    type: "position";
    value: "top-right" | "bottom-right" | "bottom-left" | "top-left";
}

export interface NumberSetting extends SettingItem {
    type: "number";
    value: number;
    min: number;
    max: number;
    step?: number;
}

export interface FileSetting extends SettingItem {
    type: "file";
    value: string;
    clearable?: boolean;
    accept?: string;
    multiple?: boolean;
}

export type Setting<T = any> = FileSetting | NumberSetting | PositionSetting | ColorSetting | KeybindSetting | RadioSetting<T> | TextSetting | SliderSetting | DropdownSetting<T> | SwitchSetting;

export interface SettingsCategory {
    type: "category";
    id: string;
    name?: string;
    collapsible: boolean;
    shown: boolean;
    settings: SettingItem[];
}