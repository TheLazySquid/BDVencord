import type React from "react";
import type ReactDOMBaseType from "react-dom";
import type ReactDOMClientType from "react-dom/client";
import type { ReactSpring, SimpleMarkdown, Dispatcher, InviteActions, RemoteModule, FluxStoreConstructor } from "../types/modules";
import { getBulkKeyed, Filters } from "./index";

interface ModuleQueries {
    React: typeof React;
    ReactDOMBase: typeof ReactDOMBaseType;
    ReactDOMClient: typeof ReactDOMClientType;
    RemoteModule: RemoteModule;
    InviteActions: InviteActions;
    ReactSpring: ReactSpring;
    Dispatcher: Dispatcher;
    Tooltip: React.ComponentType<{ color?: string; position?: string; text?: string; children: React.FunctionComponent; }>;
    User: any;
    createBotMessage: any;
    Messages: any;
    Icons: any;
    Sidebar: { A(p: { sections: any[]; }): void; };
    AccessibilityContext: React.Context<{ reducedMotion: { enabled: false; }; }>;
    Anims: any;
    FocusLock: any;
    IndexStore: unknown;
    Authorizer: unknown;
    ContextMenuMenu: any;
    ContextMenuToPatch: any;
    SimpleMarkdown: SimpleMarkdown;
    Flux: {Store: FluxStoreConstructor;};
    PrivateChannelActions: {openPrivateChannel(me: string, them: string): void;};
    ChannelActions: {selectPrivateChannel(id: string): void; selectVoiceChannel(a: any, b: any): void;};
    
    iconClasses: any;
    builtInSeperatorClasses: any;
    AnchorClasses: { anchor: string; anchorUnderlineOnHover: string; };
}

type Modules = ModuleQueries & {
    ReactDOM: typeof ReactDOMBaseType & typeof ReactDOMClientType;
};

const modules: Modules = {} as Modules;

export function loadModules() {
    const syncModules = getBulkKeyed<ModuleQueries>({
        React: {
            filter: Filters.byKeys(["createElement", "cloneElement"]),
            firstId: 483362,
            cacheId: "core-React"
        },
        ReactDOMBase: {
            filter: Filters.byKeys(["createPortal"]),
            firstId: 165737,
            cacheId: "core-ReactDOMBase"
        },
        ReactDOMClient: {
            filter: Filters.byKeys(["createRoot"]),
            firstId: 152792,
            cacheId: "core-ReactDOMClient"
        },
        Dispatcher: {
            filter: Filters.byKeys(["dispatch", "subscribe", "register"]),
            firstId: 570140,
            cacheId: "core-Dispatcher",
            searchExports: true
        },
        RemoteModule: {
            filter: Filters.byKeys(["setBadge"]),
            firstId: 998502,
            cacheId: "core-RemoteModule"
        },
        InviteActions: {
            filter: Filters.byKeys(["createInvite"]),
            firstId: 447543,
            cacheId: "core-InviteActions"
        },
        AccessibilityContext: {
            filter: m => m?._currentValue?.reducedMotion,
            searchExports: true,
            firstId: 159691,
            cacheId: "core-AccessibilityContext"
        },
        FocusLock: {
            filter: m => m?.render?.toString().includes("impressionProperties") && m?.render?.toString().includes(".Provider"),
            searchExports: true,
            firstId: 481060,
            cacheId: "core-FocusLock"
        },
        ReactSpring: {
            filter: Filters.byKeys(["useTransition", "animated"]),
            firstId: 429783,
            cacheId: "core-ReactSpring"
        },
        Anims: {
            filter: Filters.byKeys(["Easing"]),
            firstId: 748780,
            cacheId: "core-Anims"
        },
        SimpleMarkdown: {
            filter: Filters.byKeys(["parseBlock", "parseInline", "defaultOutput"]),
            firstId: 159635,
            cacheId: "core-SimpleMarkdown"
        },
        Tooltip: {
            filter: Filters.byPrototypeKeys(["renderTooltip"]),
            searchExports: true,
            firstId: 481060,
            cacheId: "core-Tooltip"
        },
        User: {
            filter: Filters.byStrings("hasHadPremium(){"),
            firstId: 598077,
            cacheId: "core-User"
        },
        createBotMessage: {
            filter: Filters.byStrings("username:\"Clyde\""),
            searchExports: true,
            firstId: 3148,
            cacheId: "core-createBotMessage"
        },
        Messages: {
            filter: Filters.byKeys(["receiveMessage"]),
            firstId: 904245,
            cacheId: "core-Messages"
        },
        Icons: {
            filter: Filters.byKeys(["BOT_AVATARS"]),
            firstId: 426563,
            cacheId: "core-Icons"
        },
        Sidebar: {
            filter: Filters.byStrings(".BUILT_IN?", "categoryListRef:"),
            defaultExport: false,
            firstId: 56801,
            cacheId: "core-Sidebar"
        },
        Flux: {
            filter: m => m.Store?.getAll,
            firstId: 442837,
            cacheId: "core-Flux"
        },
        ContextMenuMenu: {
            filter: Filters.byStrings("getContainerProps()", ".keyboardModeEnabled&&null!="),
            searchExports: true,
            firstId: 481060,
            cacheId: "core-ContextMenuMenu"
        },
        ContextMenuToPatch: {
            filter: m => Object.values(m).some(v => typeof v === "function" && v.toString().includes(`type:"CONTEXT_MENU_CLOSE"`)),
            firstId: 239091,
            cacheId: "core-ContextMenuToPatch"
        },
        PrivateChannelActions: {
            filter: Filters.byKeys(["openPrivateChannel"]),
            firstId: 493683,
            cacheId: "core-PrivateChannelActions"
        },
        ChannelActions: {
            filter: Filters.byKeys(["selectPrivateChannel"]),
            firstId: 287734,
            cacheId: "core-ChannelActions"
        },
        // Used as target for getWithKey
        IndexStore: {
            filter: Filters.bySource(".getScoreWithoutLoadingLatest"),
            firstId: 213459,
            cacheId: "core-IndexStore"
        },
        Authorizer: {
            filter: Filters.bySource("openOAuth2Modal", "Promise.resolve", "commandIntegrationTypes"),
            firstId: 104919,
            cacheId: "core-Authorizer"
        },
        // Class modules have ids that frequently change, so a firstId isn't provided
        iconClasses: {
            filter: x => x.wrapper && x.icon && x.selected && x.selectable && !x.mask,
            cacheId: "core-iconClasses"
        },
        builtInSeperatorClasses: {
            filter: Filters.byKeys(["builtInSeparator"]),
            cacheId: "core-builtInSeperatorClasses"
        },
        AnchorClasses: {
            filter: Filters.byKeys(["anchorUnderlineOnHover"]),
            cacheId: "core-AnchorClasses"
        }
    });

    modules.ReactDOM = Object.assign({}, syncModules.ReactDOMBase, syncModules.ReactDOMClient);

    Object.assign(modules, syncModules);
}

export default modules;