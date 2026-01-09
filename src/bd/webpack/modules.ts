import type React from "react";
import type ReactDOMBaseType from "react-dom";
import type ReactDOMClientType from "react-dom/client";
import type { ReactSpring, SimpleMarkdown, Dispatcher, InviteActions, RemoteModule, UserAgentInfo, GetClientInfo } from "../types/modules";
import { getBulkKeyed, Filters, getBySource, getModule, getByKeys, getByStrings } from "./index";
import memoize from "../utils/memoize";

interface ModuleQueries {
    React: typeof React;
    ReactDOMBase: typeof ReactDOMBaseType;
    ReactDOMClient: typeof ReactDOMClientType;
    RemoteModule: RemoteModule;
    InviteActions: InviteActions;
    ReactSpring: ReactSpring;
    // SimpleMarkdownWrapper: SimpleMarkdown;
    Dispatcher: Dispatcher;
    Tooltip: React.ComponentType<{ color?: string; position?: string; text?: string; children: React.FunctionComponent; }>;
    // TabBarComponent: unknown;
    // UserProfileComponent: unknown;
    User: any;
    createBotMessage: any;
    Messages: any;
    Icons: any;
    Sidebar: { Z(p: { sections: any[]; }): void; };
    AccessibilityContext: React.Context<{ reducedMotion: { enabled: false; }; }>;
    Anims: any;
    FocusLock: any;
    // closeUserSettings: () => boolean;
    // UserSettingsActions: { open(id: string): void; close(): void; };
    // UserSettings: any;
    // PrivateChannelActions: { openPrivateChannel(me: string, them: string): void; };
    // ChannelActions: { selectPrivateChannel(id: string): void; selectVoiceChannel(a: any, b: any): void; };
    // ContextMenuMethods: unknown;
    // // This is supposed to be a fallback but the original filter is broken, so this always is needed
    // ContextMenuComponent: any;

    IndexStore: unknown;
    Authorizer: unknown;

    iconClasses: any;
    builtInSeperatorClasses: any;
    AnchorClasses: { anchor: string; anchorUnderlineOnHover: string; };

    SimpleMarkdown: SimpleMarkdown;
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
            cacheId: "core-Dispatcher"
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

    // const syncModules = getBulkKeyed<Modules>({
    //     React: {
    //         filter: Filters.byKeys(["createElement", "cloneElement"]),
    //         firstId: 483362,
    //         cacheId: "core-React"
    //     },
    //     ReactDOMBase: {
    //         filter: Filters.byKeys(["createPortal"]),
    //         firstId: 165737,
    //         cacheId: "core-ReactDOMBase"
    //     },
    //     ReactDOMClient: {
    //         filter: Filters.byKeys(["createRoot"]),
    //         firstId: 152792,
    //         cacheId: "core-ReactDOMClient"
    //     },
    //     SimpleMarkdownWrapper: {
    //         filter: Filters.byKeys(["defaultRules", "parse"]),
    //         firstId: 454585,
    //         cacheId: "core-SimpleMarkdownWrapper"
    //     },
    //     Dispatcher: {
    //         filter: Filters.byKeys(["dispatch", "subscribe", "register"]),
    //         firstId: 570140,
    //         cacheId: "core-Dispatcher"
    //     },
    //     TabBarComponent: {
    //         filter: Filters.byStrings("({getFocusableElements:()=>{let"),
    //         searchExports: true,
    //         firstId: 159691,
    //         cacheId: "core-TabBarComponent"
    //     },
    //     UserProfileComponent: {
    //         filter: (m) => m.render?.toString?.().includes("pendingThemeColors"),
    //         firstId: 502762,
    //         cacheId: "core-UserProfileComponent"
    //     },
    //     closeUserSettings: {
    //         filter: Filters.byStrings("closeUserSettings"),
    //         firstId: 342386,
    //         cacheId: "core-closeUserSettings"
    //     },
    //     UserSettingsActions: {
    //         filter: Filters.byKeys(["updateAccount"]),
    //         firstId: 230711,
    //         cacheId: "core-UserSettings"
    //     },
    //     UserSettings: {
    //         filter: Filters.byKeys(["openUserSettings", "openUserSettingsFromParsedUrl"]),
    //         firstId: 518596,
    //         cacheId: "core-UserSettings"
    //     },
    //     PrivateChannelActions: {
    //         filter: Filters.byKeys(["openPrivateChannel"]),
    //         firstId: 493683,
    //         cacheId: "core-PrivateChannelActions"
    //     },
    //     ChannelActions: {
    //         filter: Filters.byKeys(["selectPrivateChannel"]),
    //         firstId: 287734,
    //         cacheId: "core-ChannelActions"
    //     },
    //     ContextMenuMethods: {
    //         filter: m => Object.values(m).some(v => typeof v === "function" && v.toString().includes(`type:"CONTEXT_MENU_CLOSE"`)),
    //         firstId: 239091,
    //         cacheId: "core-ContextMenuMethods"
    //     },
    //     ContextMenuComponent: {
    //         filter: Filters.byStrings("getContainerProps()", ".keyboardModeEnabled&&null!="),
    //         searchExports: true,
    //         firstId: 481060,
    //         cacheId: "core-ContextMenuComponent"
    //     },
    // });

    // const memoModules = memoize({
    //     get InviteActions(): InviteActions | undefined { return getByKeys(["createInvite"], { firstId: 447543, cacheId: "core-InviteActions" }); },
    //     get SimpleMarkdown(): SimpleMarkdown | undefined { return getByKeys(["parseBlock", "parseInline", "defaultOutput"], { firstId: 159635, cacheId: "core-SimpleMarkdown" }); },
    //     get promptToUpload() { return getByStrings(["getUploadCount", ".UPLOAD_FILE_LIMIT_ERROR"], { searchExports: true, firstId: 127654, cacheId: "core-promptToUpload" }); },
    //     get RemoteModule(): RemoteModule | undefined { return getByKeys(["setBadge"], { firstId: 998502, cacheId: "core-RemoteModule" }); },
    //     get UserAgentInfo(): UserAgentInfo | undefined { return getByKeys(["os", "layout"], { firstId: 264344, cacheId: "core-UserAgentInfo" }); },
    //     get GetClientInfo(): GetClientInfo | undefined { return getByStrings(["versionHash"], { firstId: 104639, cacheId: "core-GetClientInfo" }); },
    //     get MessageUtils() { return getByKeys(["sendMessage"], { firstId: 904245, cacheId: "core-MessageUtils" }); },
    //     get LinkParser(): any { return getModule(m => m.html && m.requiredFirstCharacters?.[0] === "[", { firstId: 772096, cacheId: "core-LinkParser" }); },
    //     get DiscordMarkdown(): any { return getModule(m => m?.prototype?.render && m.rules, { firstId: 241209, cacheId: "core-DiscordMarkdown" }); },
    //     get Layout(): Record<string, any> { return getBySource(["$Root", "buildLayout"], { searchDefault: false, firstId: 509613, cacheId: "core-Layout" })!; },
    //     get NoticesBaseClasses(): { base: string; } | undefined { return getByKeys(["container", "base", "sidebar"], { cacheId: "core-NoticesBaseClasses" }); },
    //     get NoticesPageClasses(): { errorPage: string; } | undefined { return getByKeys(["errorPage"], { cacheId: "core-NoticesPageClasses" }); },
    //     get ViewClasses(): { standardSidebarView: string; } | undefined { return getByKeys(["standardSidebarView"], { cacheId: "core-ViewClasses" }); },
    // });

    // Object.assign(modules, syncModules, memoModules);
    // console.log(modules);
}

export default modules;