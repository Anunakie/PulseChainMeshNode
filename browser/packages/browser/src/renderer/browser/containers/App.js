import React, { useEffect, useState, useCallback, useRef } from 'react';

import WindowControls from '../../components/WindowControls';
import TitleBar from '../../components/TitleBar';
import Main from './Main';

import styles from './app.module.css';

const App = () => {
    const [tabs, setTabs] = useState([]);
    const [selectedTab, setSelectedTab] = useState(null);
    const [currentUrl, setCurrentUrl] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pageTitle, setPageTitle] = useState('New Tab');
    const [tabTitles, setTabTitles] = useState({});
    const [tabFavicons, setTabFavicons] = useState({});

    // Adblock state
    const [blockedCount, setBlockedCount] = useState(0);
    const [showAdblockInfo, setShowAdblockInfo] = useState(false);
    const adblockInfoRef = useRef(null);

    // History state
    const [showHistory, setShowHistory] = useState(false);
    const [historyEntries, setHistoryEntries] = useState([]);
    const [historyLimit, setHistoryLimit] = useState(10);
    const [showSettings, setShowSettings] = useState(false);
    const [limitInput, setLimitInput] = useState('10');
    const historyRef = useRef(null);

    // Fetch current tabs on mount
    const getCurrentTabs = useCallback(async () => {
        try {
            const currentTabs = await window.electronApi.getCurrentTabs();
            if (currentTabs && currentTabs.length > 0) {
                setTabs(currentTabs);
            }
        } catch (err) {
            console.error('Failed to get current tabs:', err);
        }
    }, []);

    useEffect(() => {
        setTimeout(() => getCurrentTabs(), 500);
    }, [getCurrentTabs]);

    // Poll adblock stats every 3 seconds
    useEffect(() => {
        const fetchAdblockStats = async () => {
            try {
                if (window.adblockApi) {
                    const stats = await window.adblockApi.getStats();
                    setBlockedCount(stats.totalBlocked || 0);
                }
            } catch (err) {
                console.error('Failed to get adblock stats:', err);
            }
        };
        fetchAdblockStats();
        const interval = setInterval(fetchAdblockStats, 3000);
        return () => clearInterval(interval);
    }, []);

    // Load history limit on mount
    useEffect(() => {
        const loadHistoryLimit = async () => {
            try {
                if (window.historyApi) {
                    const limit = await window.historyApi.getLimit();
                    setHistoryLimit(limit);
                    setLimitInput(String(limit));
                }
            } catch (err) {
                console.error('Failed to get history limit:', err);
            }
        };
        loadHistoryLimit();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (adblockInfoRef.current && !adblockInfoRef.current.contains(event.target)) {
                setShowAdblockInfo(false);
            }
            if (historyRef.current && !historyRef.current.contains(event.target)) {
                setShowHistory(false);
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Set up IPC event listeners
    useEffect(() => {
        const handleTabsFound = (_event, value) => {
            console.log('tabsFound', value);
            setTabs(value || []);
        };

        const handleTabSelected = (_event, value) => {
            console.log('onTabSelected', value);
            setSelectedTab(value);
        };

        const handleDidNavigate = (_event, value) => {
            console.log('didNavigate', value);
            if (value && value.url) {
                setCurrentUrl(value.url);
                setInputUrl(value.url);
                setIsLoading(false);
            }
        };

        const handleDidNavigateInPage = (_event, value) => {
            console.log('didNavigateInPage', value);
            if (value && value.url && value.isMainFrame) {
                setCurrentUrl(value.url);
                setInputUrl(value.url);
            }
        };

        const handleDidStartLoading = (_event, value) => {
            setIsLoading(true);
        };

        const handleDidStopLoading = (_event, value) => {
            setIsLoading(false);
        };

        const handlePageTitleUpdated = (_event, value) => {
            if (value && value.title && value.tabId) {
                setTabTitles((prev) => ({ ...prev, [value.tabId]: value.title }));
                if (value.tabId === selectedTab) {
                    setPageTitle(value.title);
                }
            }
        };

        const handlePageFaviconUpdated = (_event, value) => {
            if (value && value.icons && value.icons.length > 0 && value.tabId) {
                setTabFavicons((prev) => ({ ...prev, [value.tabId]: value.icons[0] }));
            }
        };

        window.electronApi.onTabsFound(handleTabsFound);
        window.electronApi.onTabSelected(handleTabSelected);
        window.electronApi.onDidNavigate(handleDidNavigate);
        window.electronApi.onDidNavigateInPage(handleDidNavigateInPage);
        window.electronApi.onDidStartLoading(handleDidStartLoading);
        window.electronApi.onDidStopLoading(handleDidStopLoading);
        window.electronApi.onPageTitleUpdated(handlePageTitleUpdated);
        window.electronApi.onPageFaviconUpdated(handlePageFaviconUpdated);
    }, [selectedTab]);

    // Navigation handlers
    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (!inputUrl.trim()) return;

        let url = inputUrl.trim();

        // If it looks like a search query (no dots, no protocol), search with DuckDuckGo
        if (!url.includes('.') && !url.startsWith('http')) {
            url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
        } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        setIsLoading(true);
        if (selectedTab) {
            window.electronApi.loadUrl({ url, id: selectedTab });
        } else {
            window.electronApi.loadUrl({ url });
        }
    };

    const handleRefresh = () => {
        if (selectedTab) {
            setIsLoading(true);
            window.electronApi.refreshTab({ id: selectedTab });
        }
    };

    const handleHome = () => {
        if (selectedTab) {
            window.electronApi.goHomeTab({ id: selectedTab });
        }
    };

    const handleSelectTab = (id) => {
        window.electronApi.selectTab(id);
    };

    const handleNewTab = async () => {
        try {
            const tabId = await window.electronApi.newTab();
            console.log('New tab created:', tabId);
        } catch (err) {
            console.error('Failed to create new tab:', err);
        }
    };

    const handleQuickLink = (url) => {
        setInputUrl(url);
        setIsLoading(true);
        if (selectedTab) {
            window.electronApi.loadUrl({ url, id: selectedTab });
        } else {
            window.electronApi.loadUrl({ url });
        }
    };

    const getTabDisplayName = (id) => {
        if (tabTitles[id]) {
            const title = tabTitles[id];
            return title.length > 20 ? title.substring(0, 20) + '...' : title;
        }
        return 'Tab ' + id;
    };

    // History handlers
    const loadHistory = async () => {
        try {
            if (window.historyApi) {
                const entries = await window.historyApi.getHistory();
                setHistoryEntries(entries || []);
            }
        } catch (err) {
            console.error('Failed to load history:', err);
        }
    };

    const toggleHistory = () => {
        if (!showHistory) {
            loadHistory();
        }
        setShowHistory(!showHistory);
        setShowSettings(false);
    };

    const handleHistoryClick = (url) => {
        setShowHistory(false);
        setInputUrl(url);
        setIsLoading(true);
        if (selectedTab) {
            window.electronApi.loadUrl({ url, id: selectedTab });
        } else {
            window.electronApi.loadUrl({ url });
        }
    };

    const handleDeleteHistoryEntry = async (index, e) => {
        e.stopPropagation();
        try {
            if (window.historyApi) {
                const entries = await window.historyApi.deleteEntry(index);
                setHistoryEntries(entries || []);
            }
        } catch (err) {
            console.error('Failed to delete history entry:', err);
        }
    };

    const handleClearHistory = async () => {
        try {
            if (window.historyApi) {
                await window.historyApi.clearHistory();
                setHistoryEntries([]);
            }
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    const handleSaveLimit = async () => {
        const newLimit = parseInt(limitInput, 10);
        if (isNaN(newLimit) || newLimit < 1) {
            setLimitInput(String(historyLimit));
            return;
        }
        try {
            if (window.historyApi) {
                const result = await window.historyApi.setLimit(newLimit);
                setHistoryLimit(result.limit);
                setLimitInput(String(result.limit));
                setHistoryEntries(result.history || []);
            }
        } catch (err) {
            console.error('Failed to set history limit:', err);
        }
    };

    const formatTimestamp = (ts) => {
        try {
            const d = new Date(ts);
            const now = new Date();
            const diffMs = now - d;
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return diffMins + 'm ago';
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return diffHours + 'h ago';
            const diffDays = Math.floor(diffHours / 24);
            return diffDays + 'd ago';
        } catch (e) {
            return '';
        }
    };

    const hasActivePage = tabs.length > 0 && selectedTab;

    return (
        <div className={styles.app}>
            {/* Title Bar */}
            <TitleBar />
            <WindowControls />

            {/* Tab Bar */}
            <div className={styles.tabBar}>
                <div className={styles.tabList}>
                    {tabs.map((id) => (
                        <div
                            key={id}
                            className={`${styles.tab} ${id === selectedTab ? styles.tabActive : ''}`}
                            onClick={() => handleSelectTab(id)}
                        >
                            {tabFavicons[id] && (
                                <img
                                    src={tabFavicons[id]}
                                    className={styles.tabFavicon}
                                    alt=""
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                            <span className={styles.tabTitle}>{getTabDisplayName(id)}</span>
                        </div>
                    ))}
                </div>
                <button className={styles.newTabBtn} onClick={handleNewTab} title="New Tab">
                    +
                </button>
            </div>

            {/* Navigation Bar */}
            <div className={styles.navbar}>
                <div className={styles.navButtons}>
                    <button
                        className={styles.navBtn}
                        onClick={handleRefresh}
                        title="Refresh"
                    >
                        {isLoading ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                            </svg>
                        )}
                    </button>
                    <button
                        className={styles.navBtn}
                        onClick={handleHome}
                        title="Home"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        </svg>
                    </button>
                </div>

                {/* URL Bar */}
                <form className={styles.urlForm} onSubmit={handleUrlSubmit}>
                    <div className={styles.urlBarContainer}>
                        {currentUrl.startsWith('https://') && (
                            <svg className={styles.lockIcon} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                            </svg>
                        )}
                        <input
                            type="text"
                            className={styles.urlInput}
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            placeholder="Search with DuckDuckGo or enter URL..."
                            onFocus={(e) => e.target.select()}
                        />
                        {isLoading && <div className={styles.loadingIndicator} />}
                    </div>
                </form>

                {/* Privacy Tools */}
                <div className={styles.privacyTools}>
                    {/* Shield / Adblock Button */}
                    <div className={styles.shieldContainer} ref={adblockInfoRef}>
                        <button
                            className={styles.navBtn + ' ' + styles.shieldBtn}
                            onClick={() => setShowAdblockInfo(!showAdblockInfo)}
                            title={blockedCount + ' ads/trackers blocked'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                            </svg>
                            {blockedCount > 0 && (
                                <span className={styles.shieldBadge}>
                                    {blockedCount > 999 ? '999+' : blockedCount}
                                </span>
                            )}
                        </button>
                        {showAdblockInfo && (
                            <div className={styles.dropdown}>
                                <div className={styles.dropdownHeader}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#4ade80">
                                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                                    </svg>
                                    <span>Ad & Tracker Shield</span>
                                </div>
                                <div className={styles.dropdownBody}>
                                    <div className={styles.statRow}>
                                        <span className={styles.statLabel}>Blocked</span>
                                        <span className={styles.statValue}>{blockedCount}</span>
                                    </div>
                                    <div className={styles.statRow}>
                                        <span className={styles.statLabel}>Status</span>
                                        <span className={styles.statActive}>Active</span>
                                    </div>
                                    <p className={styles.dropdownNote}>
                                        Blocking ads, trackers, and fingerprinting scripts to protect your privacy.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* History Button */}
                    <div className={styles.historyContainer} ref={historyRef}>
                        <button
                            className={styles.navBtn + ' ' + styles.historyBtn}
                            onClick={toggleHistory}
                            title="History"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                            </svg>
                        </button>
                        {showHistory && (
                            <div className={styles.dropdown + ' ' + styles.historyDropdown}>
                                <div className={styles.dropdownHeader}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#00d4ff">
                                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                                    </svg>
                                    <span>History</span>
                                    <div className={styles.headerActions}>
                                        <button
                                            className={styles.smallBtn}
                                            onClick={() => setShowSettings(!showSettings)}
                                            title="Settings"
                                        >
                                            &#9881;
                                        </button>
                                        <button
                                            className={styles.smallBtn + ' ' + styles.dangerBtn}
                                            onClick={handleClearHistory}
                                            title="Clear all history"
                                        >
                                            &#128465;
                                        </button>
                                    </div>
                                </div>
                                {showSettings && (
                                    <div className={styles.settingsPanel}>
                                        <label className={styles.settingsLabel}>
                                            Max history entries:
                                            <div className={styles.settingsInputRow}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="1000"
                                                    className={styles.settingsInput}
                                                    value={limitInput}
                                                    onChange={(e) => setLimitInput(e.target.value)}
                                                />
                                                <button
                                                    className={styles.saveBtn}
                                                    onClick={handleSaveLimit}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </label>
                                        <p className={styles.settingsNote}>
                                            Currently keeping {historyLimit} entries. Older entries are auto-deleted.
                                        </p>
                                    </div>
                                )}
                                <div className={styles.historyList}>
                                    {historyEntries.length === 0 ? (
                                        <div className={styles.emptyHistory}>No history yet</div>
                                    ) : (
                                        historyEntries.map((entry, index) => (
                                            <div
                                                key={index}
                                                className={styles.historyEntry}
                                                onClick={() => handleHistoryClick(entry.url)}
                                            >
                                                <div className={styles.historyEntryIcon}>
                                                    {entry.favicon ? (
                                                        <img
                                                            src={entry.favicon}
                                                            width="14"
                                                            height="14"
                                                            alt=""
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#606070">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className={styles.historyEntryContent}>
                                                    <div className={styles.historyEntryTitle}>
                                                        {entry.title || entry.url}
                                                    </div>
                                                    <div className={styles.historyEntryUrl}>
                                                        {entry.url.length > 50 ? entry.url.substring(0, 50) + '...' : entry.url}
                                                    </div>
                                                </div>
                                                <div className={styles.historyEntryMeta}>
                                                    <span className={styles.historyTime}>
                                                        {formatTimestamp(entry.timestamp)}
                                                    </span>
                                                    <button
                                                        className={styles.deleteEntryBtn}
                                                        onClick={(e) => handleDeleteHistoryEntry(index, e)}
                                                        title="Delete entry"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area - shows welcome page when no active page */}
            <div className={styles.contentArea}>
                {!hasActivePage && <Main onNavigate={handleQuickLink} />}
            </div>
        </div>
    );
};

export default App;
