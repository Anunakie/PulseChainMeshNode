import React, { useState, useEffect, useRef } from 'react';
import styles from './main.module.css';

const Main = () => {
    const [url, setUrl] = useState('https://pulsechain.com');
    const [inputUrl, setInputUrl] = useState('https://pulsechain.com');
    const [isLoading, setIsLoading] = useState(false);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [pageTitle, setPageTitle] = useState('PulseMesh Browser');

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        let newUrl = inputUrl;
        if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
            newUrl = 'https://' + newUrl;
        }
        setUrl(newUrl);
        setIsLoading(true);
        
        // Use electronApi to navigate if available
        if (window.electronApi && window.electronApi.navigate) {
            window.electronApi.navigate(newUrl);
        }
    };

    const handleBack = () => {
        if (window.electronApi && window.electronApi.goBack) {
            window.electronApi.goBack();
        }
    };

    const handleForward = () => {
        if (window.electronApi && window.electronApi.goForward) {
            window.electronApi.goForward();
        }
    };

    const handleRefresh = () => {
        setIsLoading(true);
        if (window.electronApi && window.electronApi.refresh) {
            window.electronApi.refresh();
        }
    };

    const handleHome = () => {
        const homeUrl = 'https://pulsechain.com';
        setUrl(homeUrl);
        setInputUrl(homeUrl);
        if (window.electronApi && window.electronApi.navigate) {
            window.electronApi.navigate(homeUrl);
        }
    };

    return (
        <div className={styles.browserContainer}>
            {/* Navigation Bar */}
            <div className={styles.navbar}>
                <div className={styles.navButtons}>
                    <button 
                        className={styles.navBtn} 
                        onClick={handleBack}
                        disabled={!canGoBack}
                        title="Go Back"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                        </svg>
                    </button>
                    <button 
                        className={styles.navBtn} 
                        onClick={handleForward}
                        disabled={!canGoForward}
                        title="Go Forward"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                        </svg>
                    </button>
                    <button 
                        className={styles.navBtn} 
                        onClick={handleRefresh}
                        title="Refresh"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={isLoading ? styles.spinning : ''}>
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
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
                        <svg className={styles.lockIcon} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                        <input
                            type="text"
                            className={styles.urlInput}
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            placeholder="Enter URL or search..."
                        />
                        {isLoading && <div className={styles.loadingIndicator} />}
                    </div>
                </form>

                {/* Menu Button */}
                <button className={styles.menuBtn} title="Menu">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                </button>
            </div>

            {/* Welcome Screen / Content Area */}
            <div className={styles.contentArea}>
                <div className={styles.welcomeScreen}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>🌐</div>
                        <h1 className={styles.logoText}>PulseMesh Browser</h1>
                    </div>
                    <p className={styles.tagline}>Privacy-First Decentralized Browsing</p>
                    
                    <div className={styles.quickLinks}>
                        <h3>Quick Links</h3>
                        <div className={styles.linkGrid}>
                            <a href="#" className={styles.quickLink} onClick={(e) => { e.preventDefault(); setInputUrl('https://pulsechain.com'); setUrl('https://pulsechain.com'); }}>
                                <div className={styles.linkIcon}>💜</div>
                                <span>PulseChain</span>
                            </a>
                            <a href="#" className={styles.quickLink} onClick={(e) => { e.preventDefault(); setInputUrl('https://pulsex.com'); setUrl('https://pulsex.com'); }}>
                                <div className={styles.linkIcon}>🔄</div>
                                <span>PulseX</span>
                            </a>
                            <a href="#" className={styles.quickLink} onClick={(e) => { e.preventDefault(); setInputUrl('https://hex.com'); setUrl('https://hex.com'); }}>
                                <div className={styles.linkIcon}>💎</div>
                                <span>HEX</span>
                            </a>
                            <a href="#" className={styles.quickLink} onClick={(e) => { e.preventDefault(); setInputUrl('https://app.pulsex.com'); setUrl('https://app.pulsex.com'); }}>
                                <div className={styles.linkIcon}>📊</div>
                                <span>PulseX App</span>
                            </a>
                        </div>
                    </div>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🛡️</span>
                            <span>Ad Blocking</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🔒</span>
                            <span>Privacy Mode</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🌐</span>
                            <span>Mesh Network</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>💰</span>
                            <span>Web3 Wallet</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;
