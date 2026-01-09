export default abstract class AddonManager {
    abstract addonFolder: string;
    public addonList: any[] = [];

    isEnabled(idOrFile: string) { return false }
    enableAddon(idOrAddon: string) {}
    disableAddon(idOrAddon: string) {}
    toggleAddon(idOrAddon: string) {}
    reloadAddon(idOrFileOrAddon: string) {}
    getAddon(idOrFile: string) {}
}