import type AddonManager from "../core/addonmanager";

/**
 * `AddonAPI` is a utility class for working with plugins and themes. Instances are accessible through the {@link BdApi}.
 * @name AddonAPI
 */
class AddonAPI {
    #manager: AddonManager;

    constructor(manager: AddonManager) {this.#manager = manager;}

    /**
     * The path to the addon folder.
     * @type string
     */
    get folder() {return this.#manager.addonFolder;}

    /**
     * Determines if a particular addon is enabled.
     * @param {string} idOrFile Addon ID or filename
     * @returns {boolean}
     */
    isEnabled(idOrFile: string) {return this.#manager.isEnabled(idOrFile);}

    /**
     * Enables the given addon.
     * @param {string} idOrFile Addon ID or filename
     */
    enable(idOrFile: string) {return this.#manager.enableAddon(idOrFile);}

    /**
     * Disables the given addon.
     * @param {string} idOrFile Addon ID or filename
     */
    disable(idOrFile: string) {return this.#manager.disableAddon(idOrFile);}

    /**
     * Toggles if a particular addon is enabled.
     * @param {string} idOrFile Addon ID or filename
     */
    toggle(idOrFile: string) {return this.#manager.toggleAddon(idOrFile);}

    /**
     * Reloads if a particular addon is enabled.
     * @param {string} idOrFile Addon ID or filename
     */
    reload(idOrFile: string) {return this.#manager.reloadAddon(idOrFile);}

    /**
     * Gets a particular addon.
     * @param {string} idOrFile Addon ID or filename
     * @returns {object} Addon instance
     */
    get(idOrFile: string) {return this.#manager.getAddon(idOrFile);}

    /**
     * Gets all addons of this type.
     * @returns {Array<object>} Array of all addon instances
     */
    getAll() {return this.#manager.addonList.map(a => this.#manager.getAddon(a.id));}
}

Object.freeze(AddonAPI);
Object.freeze(AddonAPI.prototype);

export default AddonAPI;