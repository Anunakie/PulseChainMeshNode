const path = require('path');
const fs = require('fs');

const makers = [
    {
        name: '@electron-forge/maker-squirrel',
        config: {
            name: 'PulseMeshBrowser',
            setupExe: 'PulseMeshBrowser-Setup.exe',
            setupIcon: './src/main/icons/icon.ico',
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
                bin: 'PulseMeshBrowser',
            }
        },
    },
];

// Only add DMG maker on macOS
if (process.platform === 'darwin') {
    try {
        require.resolve('@electron-forge/maker-dmg');
        makers.push({
            name: '@electron-forge/maker-dmg',
            config: {
                name: 'PulseMeshBrowser',
                format: 'ULFO',
            },
        });
    } catch (e) {
        // maker-dmg not installed, skip
    }
}

// Build extraResource list - include bin directory if it has files
const extraResource = [];
const binDir = path.join(__dirname, 'bin');
if (fs.existsSync(binDir)) {
    const binFiles = fs.readdirSync(binDir).filter(f => !f.startsWith('.'));
    if (binFiles.length > 0) {
        extraResource.push('./bin');
    }
}

module.exports = {
    packagerConfig: {
        name: 'PulseMesh Browser',
        executableName: 'PulseMeshBrowser',
        appBundleId: 'com.pulsechainmeshnode.browser',
        icon: './src/main/icons/icon',
        appCopyright: 'Copyright (C) 2024 PulseChainMeshNode Community',
        extraResource: extraResource,
    },
    rebuildConfig: {},
    makers: makers,
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
