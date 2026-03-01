import Remote from "./polyfill/remote";

export const DATA_DIR = VencordNative.bd.getDataDir();
export const BD_THEMES_DIR = Remote.path.join(DATA_DIR, "themes");
export const BD_PLUGINS_DIR = Remote.path.join(DATA_DIR, "plugins");