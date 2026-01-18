module.exports = {
    packagerConfig: {
        name: 'PulseMesh Browser',
        executableName: 'PulseMeshBrowser',
        appBundleId: 'com.pulsechainmeshnode.browser',
        icon: './src/main/icons/icon',
        appCopyright: 'Copyright (C) 2024 PulseChainMeshNode Community',
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'PulseMeshBrowser',
                setupExe: 'PulseMeshBrowser-Setup.exe',
                setupIcon: './src/main/icons/icon.ico',
                iconUrl: 'https://raw.githubusercontent.com/Anunakie/PulseChainMeshNode/main/browser/packages/browser/src/main/icons/icon.ico',
                loadingGif: './src/main/icons/installing.gif',
                // Create desktop and start menu shortcuts
                createDesktopShortcut: true,
                createStartMenuShortcut: true,
                shortcutName: 'PulseMesh Browser',
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin', 'win32', 'linux'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    name: 'pulsemesh-browser',
                    productName: 'PulseMesh Browser',
                    genericName: 'Web Browser',
                    description: 'Privacy-focused browser for PulseChain mesh network',
                    categories: ['Network', 'WebBrowser'],
                    icon: './src/main/icons/icon.png',
                }
            },
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {
                options: {
                    name: 'pulsemesh-browser',
                    productName: 'PulseMesh Browser',
                    genericName: 'Web Browser',
                    description: 'Privacy-focused browser for PulseChain mesh network',
                    categories: ['Network', 'WebBrowser'],
                    icon: './src/main/icons/icon.png',
                }
            },
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-webpack',
            config: {
                mainConfig: './webpack.main.config.js',
                renderer: {
                    config: './webpack.renderer.config.js',
                    entryPoints: [
                        {
                            html: './src/renderer/browser/index.html',
                            js: './src/renderer/browser/index.js',
                            name: 'main_window',
                            preload: {
                                js: './src/renderer/browser/preload.js',
                            },
                        },
                        {
                            html: './src/renderer/extension-monitor/index.html',
                            js: './src/renderer/extension-monitor/index.js',
                            name: 'extension_monitor',
                            preload: {
                                js: './src/renderer/extension-monitor/preload.js',
                            },
                        },
                    ],
                },
            },
        },
    ],
};
