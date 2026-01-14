import { IpcEvents } from "@shared/IpcEvents";
import { ipcMain, BrowserWindow, dialog, shell } from "electron";
import { FSWatcher, mkdirSync, watch } from "fs";
import { BD_PLUGINS_DIR, DATA_DIR } from "./utils/constants";
import { readdir, readFile, stat, rm, writeFile } from "fs/promises";
import { join } from "path";
import { PluginInfo } from "bd/core/pluginmanager";

mkdirSync(BD_PLUGINS_DIR, { recursive: true });

ipcMain.on(IpcEvents.BD_GET_DATA_DIR, (e) => e.returnValue = DATA_DIR);

ipcMain.handle(IpcEvents.BD_OPEN_DIALOG, async (event, options) => {
    const {
        mode = "open",
        openDirectory = false,
        openFile = true,
        multiSelections = false,
        filters,
        promptToCreate = false,
        defaultPath,
        title,
        showOverwriteConfirmation,
        message,
        showHiddenFiles,
        modal = false
    } = options;

    if (mode !== "open" && mode !== "save") return Promise.resolve({ error: "Unkown Mode: " + mode });
    const openFunction = mode === "open" ? dialog.showOpenDialog : dialog.showSaveDialog;

    // @ts-expect-error cba to write separate types for these dialogs that are never used
    return openFunction(...[
        modal && BrowserWindow.fromWebContents(event.sender),
        {
            defaultPath,
            filters,
            title,
            message,
            createDirectory: true,
            properties: [
                showHiddenFiles && "showHiddenFiles",
                openDirectory && "openDirectory",
                promptToCreate && "promptToCreate",
                openDirectory && "openDirectory",
                openFile && "openFile",
                multiSelections && "multiSelections",
                showOverwriteConfirmation && "showOverwriteConfirmation"
            ].filter(e => e),
        }
    ].filter(e => e));
});

let pluginWatcher: FSWatcher | null = null;
const fileSet = new Set<string>();
const ignoreUpdates = new Set<string>();
ipcMain.handle(IpcEvents.BD_GET_PLUGINS, async ({ sender }) => {
    const files = await readdir(BD_PLUGINS_DIR, { withFileTypes: true });
    const pluginFiles = files
        .filter(f => f.isFile() && f.name.endsWith(".plugin.js"))
        .map(f => f.name);

    fileSet.clear();
    ignoreUpdates.clear();
    for (const file of pluginFiles) fileSet.add(file);

    // Watch the plugins directory for changes
    if (pluginWatcher) pluginWatcher.close();
    const updateTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

    pluginWatcher = watch(BD_PLUGINS_DIR, { persistent: false }, async (type, filename) => {
        if (!filename || !filename.endsWith(".plugin.js")) return;

        const filePath = join(BD_PLUGINS_DIR, filename);
        const stats = await stat(filePath).catch(() => null);

        if (!stats) {
            // Node's watcher fires event multiple times sometimes
            if (!fileSet.has(filename)) return;
            fileSet.delete(filename);

            sender.postMessage(IpcEvents.BD_PLUGIN_DELETED, filename);
            return;
        }

        if (ignoreUpdates.has(filename)) return;
        if (fileSet.has(filename) && type === "rename") return;

        // Read the new/updated plugin
        const code = await readFile(filePath, "utf-8");
        const info: PluginInfo = {
            code,
            file: filename,
            size: stats.size,
            modified: stats.mtimeMs,
            added: stats.atimeMs
        };

        if (type === "rename") {
            // Plugin created
            fileSet.add(filename);
            sender.postMessage(IpcEvents.BD_PLUGIN_CREATED, info);

            // A few changes event will also be fired, ignore it
            ignoreUpdates.add(filename);
            setTimeout(() => ignoreUpdates.delete(filename), 2000);
        } else {
            // Plugin updated, debounce changes
            if (updateTimeouts.has(filename)) clearTimeout(updateTimeouts.get(filename));
            const timeout = setTimeout(() => {
                sender.postMessage(IpcEvents.BD_PLUGIN_UPDATED, info);
                updateTimeouts.delete(filename);
            }, 500);

            updateTimeouts.set(filename, timeout);
        }
    });

    return await Promise.all(pluginFiles.map(readPluginFile));
});

const writeToFile = async (filename: string, code: string) => {
    const path = join(BD_PLUGINS_DIR, filename);

    ignoreUpdates.add(filename);
    setTimeout(() => ignoreUpdates.delete(filename), 2000);
    await writeFile(path, code);
};

ipcMain.handle(IpcEvents.BD_CREATE_PLUGIN, async (_, filename: string, code: string) => {
    await writeToFile(filename, code);
    fileSet.add(filename);
});

ipcMain.handle(IpcEvents.BD_UPDATE_PLUGIN, async (_, filename: string, code: string) => {
    await writeToFile(filename, code);
});

ipcMain.handle(IpcEvents.BD_DELETE_PLUGIN, async (_, filename: string) => {
    const path = join(BD_PLUGINS_DIR, filename);
    await rm(path);
    fileSet.delete(filename);
});

ipcMain.handle(IpcEvents.BD_OPEN_PLUGIN_FOLDER, () => shell.openPath(BD_PLUGINS_DIR));

async function readPluginFile(file: string) {
    const path = join(BD_PLUGINS_DIR, file);

    const [code, stats] = await Promise.all([
        readFile(path, "utf-8"),
        stat(path)
    ]);

    return {
        code,
        file,
        size: stats.size,
        modified: stats.mtimeMs,
        added: stats.atimeMs
    };
}