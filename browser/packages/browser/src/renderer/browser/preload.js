const { contextBridge, ipcRenderer } = require('electron');

import { injectBrowserAction } from '../../../../electron-chrome-extensions/dist/browser-action';
injectBrowserAction();

contextBridge.exposeInMainWorld('darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system'),
});

contextBridge.exposeInMainWorld('windowControls', {
    minimize: () => ipcRenderer.invoke('window-controls:minimize-window'),
    maximize: () => ipcRenderer.invoke('window-controls:maximize-window'),
    restore: () => ipcRenderer.invoke('window-controls:restore-window'),
    close: () => ipcRenderer.invoke('window-controls:close-window'),
});

contextBridge.exposeInMainWorld('electronApi', {
    loadUrl: (arg) => ipcRenderer.invoke('tab:load-url', arg),
    refreshTab: (arg) => ipcRenderer.invoke('tab:refresh-tab', arg),
    goHomeTab: (arg) => ipcRenderer.invoke('tab:gohome-tab', arg),
    newTab: () => ipcRenderer.invoke('tab:new-tab'),
    onDidNavigate: (callback) => ipcRenderer.on('tab:did-navigate', callback),
    onDidNavigateInPage: (callback) =>
        ipcRenderer.on('tab:did-navigate-in-page', callback),
    onDidStartLoading: (callback) =>
        ipcRenderer.on('tab:did-start-loading', callback),
    onDidStopLoading: (callback) =>
        ipcRenderer.on('tab:did-stop-loading', callback),
    onPageTitleUpdated: (callback) =>
        ipcRenderer.on('tab:page-title-updated', callback),
    onPageFaviconUpdated: (callback) =>
        ipcRenderer.on('tab:page-favicon-updated', callback),
    onTabsFound: (callback) => ipcRenderer.on('tabs:tabs-found', callback),
    getCurrentTabs: () => ipcRenderer.invoke('tabs:get-current-tabs'),
    selectTab: (arg) => ipcRenderer.invoke('tab:select-tab', arg),
    onTabSelected: (callback) => ipcRenderer.on('tab:tab-selected', callback),
    onTabSizeChanged: (arg) => ipcRenderer.invoke('tab:tab-size-changed', arg),
});

// Ad & Tracker Blocking API
contextBridge.exposeInMainWorld('adblockApi', {
    getStats: () => ipcRenderer.invoke('adblock:get-stats'),
    getTabStats: (tabId) => ipcRenderer.invoke('adblock:get-tab-stats', tabId),
    resetStats: () => ipcRenderer.invoke('adblock:reset-stats'),
});

// History Management API
contextBridge.exposeInMainWorld('historyApi', {
    getHistory: () => ipcRenderer.invoke('history:get'),
    addToHistory: (entry) => ipcRenderer.invoke('history:add', entry),
    clearHistory: () => ipcRenderer.invoke('history:clear'),
    deleteEntry: (index) => ipcRenderer.invoke('history:delete-entry', index),
    getLimit: () => ipcRenderer.invoke('history:get-limit'),
    setLimit: (limit) => ipcRenderer.invoke('history:set-limit', limit),
});
