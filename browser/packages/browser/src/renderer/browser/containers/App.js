import React, { useEffect, useState, useCallback } from 'react';

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
                            placeholder="Search or enter URL..."
                            onFocus={(e) => e.target.select()}
                        />
                        {isLoading && <div className={styles.loadingIndicator} />}
                    </div>
                </form>
            </div>

            {/* Content Area - shows welcome page when no active page */}
            <div className={styles.contentArea}>
                {!hasActivePage && <Main onNavigate={handleQuickLink} />}
            </div>
        </div>
    );
};

export default App;
