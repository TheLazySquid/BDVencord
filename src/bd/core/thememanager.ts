import AddonManager from "./addonmanager";
import { BD_THEMES_DIR } from "bd/consts";

export default new class ThemeManager extends AddonManager {
    addonFolder = BD_THEMES_DIR;
}