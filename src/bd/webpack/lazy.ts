import type {Webpack} from "../types";
import {getModule} from "./searching";
import {shouldSkipModule, getDefaultKey, wrapFilter, makeException} from "./shared";
import {FilterFn, waitForSubscriptions, wreq} from "@webpack";

const ChunkIdRegex = /n\.e\("(\d+)"\)/g;
const FinalModuleIdRegex = /n\.bind\(n,\s*(\d+)\s*\)/g;
const CreatePromiseId = /createPromise:\s*\(\)\s*=>\s*([^}]+)\.then\(n\.bind\(n,\s*(\d+)\)\)/g;

export function getLazy<T>(filter: Webpack.Filter, options: Webpack.LazyOptions = {}): Promise<T | undefined> {
    const {signal: abortSignal, defaultExport = true, searchDefault = true, searchExports = false, raw = false, fatal = false} = options;

    if (abortSignal?.aborted) {
        if (fatal) return Promise.reject(makeException());
        return Promise.resolve(undefined);
    }

    const cached = getModule<T>(filter, options);
    if (cached) return Promise.resolve(cached);

    filter = wrapFilter(filter);

    return new Promise((resolve, reject) => {
        const cancel = () => void waitForSubscriptions.delete(listener);

        const listener: FilterFn = (_, module) => {
            if(!module) return false;
            if (shouldSkipModule(module.exports)) return false;

            if (filter(module.exports, module, module.id)) {
                resolve(raw ? module : module.exports);
                cancel();
                return true;
            }

            if (!searchExports && !searchDefault) return false;

            let defaultKey: string | undefined;
            const searchKeys: string[] = [];
            if (searchExports) searchKeys.push(...Object.keys(module.exports));
            else if (searchDefault && (defaultKey = getDefaultKey(module))) searchKeys.push(defaultKey);

            for (let i = 0; i < searchKeys.length; i++) {
                const key = searchKeys[i];
                const exported = module.exports[key];

                if (shouldSkipModule(exported)) continue;

                if (filter(exported, module, module.id)) {
                    if (!defaultExport && defaultKey === key) {
                        resolve(raw ? module : module.exports);
                        cancel();
                        return true;
                    }

                    resolve(raw ? module : exported);
                    cancel();
                }
            }

            return false;
        };

        waitForSubscriptions.set(listener, () => {});
        abortSignal?.addEventListener("abort", () => {
            cancel();
            if (fatal) reject(makeException());
            else resolve(undefined);
        });
    });
}

export async function forceLoad(id: string | number): Promise<any[]> {
    if (typeof wreq.m[id] === "undefined") {
        return [];
    }
    const text = String(wreq.m[id]);
    const loadedModules = [];
    let match;

    while ((match = CreatePromiseId.exec(text)) !== null) {
        const promiseBody = match[1];
        const bindId = match[2];
        const chunkIds = [];
        const chunkMatches = promiseBody.matchAll(ChunkIdRegex);
        for (const chunkMatch of chunkMatches) {
            // @ts-expect-error bd
            chunkIds.push(chunkMatch[1]);
        }
        const finalId = parseInt(bindId, 10);
        await Promise.all(chunkIds.map((cid) => wreq.e(cid)));
        const loadedModule = wreq(finalId);
        // @ts-expect-error bd
        loadedModules.push(loadedModule);
    }

    const chunkIds = [];
    let chunkMatch;
    while ((chunkMatch = ChunkIdRegex.exec(text)) !== null) {
        // @ts-expect-error bd
        chunkIds.push(chunkMatch[1]);
    }

    const bindMatches = text.matchAll(FinalModuleIdRegex);
    for (const bindMatch of bindMatches) {
        await Promise.all(chunkIds.map((cid) => wreq.e(cid)));
        const loadedModule = wreq(bindMatch[1]);
        // @ts-expect-error bd
        loadedModules.push(loadedModule);
    }

    return loadedModules;
}