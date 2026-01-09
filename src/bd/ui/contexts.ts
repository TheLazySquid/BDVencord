import {React} from "@webpack/common";


export interface SettingsContextValue {
    value: any;
    disabled: boolean;
}

export const none = Symbol("betterdiscord.none");

let settingsContext: React.Context<SettingsContextValue>;
export const GetSettingsContext = () => {
    if(settingsContext) return settingsContext;
    
    settingsContext = React.createContext<SettingsContextValue>({value: none, disabled: false});
    return settingsContext;
}