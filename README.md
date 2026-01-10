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

There is currently no way to install BetterDiscord plugins from within Discord. Instead, you will need to manually place the `.plugin.js` files your `Vencord/plugins` folder. You can find the plugins folder by going to the "BD Plugins" tab in settings and pressing the "Open Plugin Folder" button.

Plugins need to be enabled from inside the BD Plugins tab in settings. Their settings can also be accessed there.

BetterDiscord plugins can be downloaded from the [BetterDiscord site](https://betterdiscord.app/plugins).

## Compatibility

BDVencord aims for 100% compatibility with BetterDiscord plugins. If you find any incompatibilities, please open an issue.