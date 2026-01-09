import { IpcEvents } from "@shared/IpcEvents";
import { ipcMain, BrowserWindow, dialog } from "electron";
import { mkdirSync } from "fs";
import { BD_PLUGINS_DIR, DATA_DIR } from "./utils/constants";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

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

ipcMain.handle(IpcEvents.BD_GET_PLUGINS, async () => {
    const files = await readdir(BD_PLUGINS_DIR, { withFileTypes: true });
    const pluginFiles = files
        .filter(f => f.isFile() && f.name.endsWith(".plugin.js"))
        .map(f => f.name);

    return await Promise.all(pluginFiles.map(readPluginFile));
});

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