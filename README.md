# BDVencord

BDVencord is a modified version of [Vencord](https://vencord.dev/) which is capable of running [BetterDiscord](https://betterdiscord.app/) plugins alongside Vencord ones. It only works on Discord Desktop.

## Installation

Right now BDVencord is still in early development, so you will need to build from source to use it.

1. Make sure you have [git](https://git-scm.com/), [Node.js](https://nodejs.org/), and [pnpm](https://pnpm.io/)
2. Clone this repository using git
3. cd into the cloned repo
4. run `pnpm install`
5. run `pnpm build`
6. run `pnpm inject`

Restart Discord and you should be good to go.

## Usage

There is currently no way to install BetterDiscord plugins from within Discord. Instead, you will need to download `.plugin.js` files from the [BetterDiscord site](https://betterdiscord.app/plugins) and the drag and drop or upload them on the "BD Plugins" tab in settings. You can also manually place them in your `Vencord/plugins` folder, which can be found with the "Open Plugins Folder" button at the top of the BD Plugins tab in settings.

Plugins need to be enabled from inside the BD Plugins tab in settings. Their settings can also be accessed there.

## Compatibility

BDVencord aims for 100% compatibility with BetterDiscord plugins. If you find any incompatibilities, please open an issue.