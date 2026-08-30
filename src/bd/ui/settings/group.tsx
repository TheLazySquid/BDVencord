import {React, useStateFromStores} from "@webpack/common";

import Drawer from "./drawer";
import Switch from "./components/switch";
import Dropdown from "./components/dropdown";
import Number from "./components/number";
import Item from "./components/item";
import Textbox from "./components/textbox";
import Slider from "./components/slider";
import Radio from "./components/radio";
import Keybind from "./components/keybind";
import ColorPicker from "./components/color";
import Filepicker from "./components/file";
import Button, {type ButtonProps} from "../base/button";
import Position from "./components/position";
import type {BaseSettingItem, Setting} from "../../types/settings";
import type {ReactNode} from "react";

export type GroupOnChange =
    & ((id: string, cid: string, value: any) => void)
    & ((id: string, value: any) => void);

export interface GroupProps {
    id: string;
    name?: string;
    button?: object;
    shown?: boolean;
    showDivider?: boolean;
    collapsible?: boolean;
    onDrawerToggle?(state?: boolean): void;
    onChange?: GroupOnChange;
    settings: any;
    collection?: any;
    children?: React.ReactNode;
};

export default function Group(props: GroupProps) {
    const {onChange, id, name = "", shown, onDrawerToggle, showDivider = false, collapsible, settings, children = null} = props;
    const change = React.useCallback((settingId: string, value: any) => {
        if (id) onChange?.(id, settingId, value);
        else onChange?.(settingId, value);
    }, [id, onChange]);

    return <Drawer collapsible={collapsible} name={name} shown={shown} onDrawerToggle={onDrawerToggle} showDivider={showDivider}>
        {settings?.length > 0 && settings.filter((s: any) => !s.hidden).map((setting: any) => {
            const callback = (value: any) => {
                setting?.onChange?.(value);
                change(setting.id, value);
            };
            const settingItem = buildSetting({...setting, onChange: callback});
            return settingItem;
        })}
        {children}
    </Drawer>;
}


export interface CustomSetting extends BaseSettingItem {
    type: "custom";
    children: ReactNode;
}

export interface ButtonSetting extends ButtonProps, BaseSettingItem {
    type: "button";
}

export function buildSetting(setting: Setting | CustomSetting | ButtonSetting) {
    const $setting: any = setting;

    let children: React.ReactElement | null = null;
    if ($setting.type === "dropdown") children = <Dropdown {...$setting} />;
    if ($setting.type === "number") children = <Number {...$setting} />;
    if ($setting.type === "switch") children = <Switch {...$setting} />;
    if ($setting.type === "text") children = <Textbox {...$setting} />;
    if ($setting.type === "file") children = <Filepicker {...$setting} />;
    if ($setting.type === "slider") children = <Slider {...$setting} />;
    if ($setting.type === "radio") children = <Radio {...$setting} />;
    if ($setting.type === "keybind") children = <Keybind {...$setting} />;
    if ($setting.type === "color") children = <ColorPicker {...$setting} />;
    if ($setting.type === "button") children = <Button {...$setting} />;
    if ($setting.type === "position") children = <Position {...$setting} />;
    if ($setting.type === "custom") children = $setting.children;
    if (!children) return null;

    return <Item
        id={$setting.id}
        inline={$setting.hasOwnProperty("inline") ? $setting.inline : $setting.type !== "radio"}
        key={$setting.id}
        name={$setting.name}
        note={$setting.note}>
        {children}
    </Item>;
}