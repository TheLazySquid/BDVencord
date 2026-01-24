import "bd/styles/index.css";
import "bd/polyfill";

import { loadModules } from "bd/webpack/modules";
import { loadStores } from "bd/webpack";
import DOMManager from "bd/core/dommanager";
import Modals from "bd/ui/modals";
import Toasts from "bd/ui/toasts";
import NotificationUIInstance from "bd/ui/notifications";
import { MenuPatcher } from "bd/api/contextmenu";
import CommandManager from "bd/core/commandmanager";
import BdApi from "bd/api";
import pluginmanager from "bd/core/pluginmanager";
import PluginStore from "./core/pluginstore";
import BDContextMenu from "./core/contextmenu";

export function onInit() {
    Object.defineProperty(window, "BdApi", {
        value: BdApi,
        writable: false,
        configurable: false
    });
}

export function onDOMReady() {
    DOMManager.init();
}

export function onWebpackReady() {
    loadStores();
    loadModules();
    MenuPatcher.initialize();
    Modals.makeStack();
    Toasts.initialize();
    NotificationUIInstance.initialize();
    CommandManager.initialize();
    pluginmanager.initialize();
    PluginStore.init();
    BDContextMenu.init();
}