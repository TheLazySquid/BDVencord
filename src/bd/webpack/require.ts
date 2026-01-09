import type { Webpack } from "../types";
import { wreq } from "@webpack";

export const modules = new Proxy({} as Webpack.Require["m"], {
    ownKeys() { return Object.keys(wreq.m); },
    getOwnPropertyDescriptor() {
        return {
            enumerable: true,
            configurable: true, // Not actually
        };
    },
    get(_, k) {
        return wreq.m[k];
    },
    set() {
        throw new Error("[WebpackModules~modules] Setting modules is not allowed.");
    }
});