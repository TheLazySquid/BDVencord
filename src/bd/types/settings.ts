export type SettingType = "button" | "custom" | "switch" | "dropdown" | "switch" | "slider" | "color" | "text" | "position" | "radio" | "file" | "keybind" | "number";

export interface BaseSettingItem {
    type: SettingType;
    /** An identifier used for callbacks */
    id: string;
    /** The visual name to display */
    name?: string;
    /** The visual description to display */
    note?: string;
    /** Whether this setting is disabled */
    disabled?: boolean;
    /** The id of another setting that is required to use this one */
    enableWith?: string;
    /** The id of another setting that disables this setting */
    disableWith?: string;
    /** A value to use if no value is provided */
    defaultValue?: unknown;
    /** Whether the input should render inline with the name (this is false by default for radio type) */
    inline?: boolean;
    /** Whether the setting should be hidden */
    hidden?: boolean;
}

export interface ValueSettingItem<T> extends BaseSettingItem {
    /** The current value of the setting */
    value: T;
    /** A callback run when the setting changes */
    onChange?(value: T): void;
}

export interface SwitchSetting extends ValueSettingItem<boolean> {
    type: "switch";
}

export interface DropdownSetting<T> extends ValueSettingItem<T> {
    type: "dropdown";
    options: Array<{id?: string; label: string; value: T;}>;
    style?: "transparent" | "default";
}

export interface SliderSetting extends ValueSettingItem<number> {
    type: "slider";
    min: number;
    max: number;
    step?: number;
    units?: string;
    markers: Array<(number | {label: string; value: number;})>;
}

export interface TextSetting extends ValueSettingItem<string> {
    type: "text";
    placeholder?: string;
    maxLength?: number;
}

export interface RadioOption<T> {
    name: string;
    value: T;
    description?: string;
    color?: string;
}

export interface RadioSetting<T> extends ValueSettingItem<T> {
    type: "radio";
    options: Array<{name: string, value: T, description: string;}>;
}

export interface KeybindSetting extends ValueSettingItem<string[]> {
    type: "keybind";
    clearable?: boolean;
    max?: number;
}

export type HexString = `#${string}`;
export type Color = HexString | number;
export interface ColorSetting extends ValueSettingItem<Color> {
    type: "color";
    defaultValue?: Color;
    colors?: Color[];
}

export type Position = "top-right" | "bottom-right" | "bottom-left" | "top-left";
export interface PositionSetting extends ValueSettingItem<Position> {
    type: "position";
}

export interface NumberSetting extends ValueSettingItem<number> {
    type: "number";
    min: number;
    max: number;
    step?: number;
}

export interface SingleFileSetting extends ValueSettingItem<string> {
    type: "file";
    multiple?: false;
    clearable?: boolean;
    accept?: string;
    actions?: {
        clear?(): void;
    };
}

export interface MultipleFileSetting extends ValueSettingItem<string[]> {
    type: "file";
    multiple: true;
    clearable?: boolean;
    accept?: string;
    actions?: {
        clear?(): void;
    };
}

export type FileSetting = SingleFileSetting | MultipleFileSetting;

type BaseSetting<T = any> = FileSetting | NumberSetting | PositionSetting | ColorSetting | KeybindSetting | RadioSetting<T> | TextSetting | SliderSetting | DropdownSetting<T> | SwitchSetting;

export type Setting<T = any> = Omit<BaseSetting<T>, "defaultValue"> & {
    defaultValue?: never | unknown | any | T;
};

export interface SettingsCategory {
    type: "category";
    id: string;
    name?: string;
    collapsible: boolean;
    shown: boolean;
    settings: Setting[];
}