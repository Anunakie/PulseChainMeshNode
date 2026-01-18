import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import WindowControl from '../../components/WindowControls';
import Main from './Main';
import TitleBar from '../../components/TitleBar';

import styles from './app.module.css';
import Tab from './Tab/Tab';

const App = () => {
    const [tabs, setTabs] = useState([]);
    const [selected, setSelected] = useState();

    const getCurrentTabs = async () => {
        const currentTabs = await window.electronApi.getCurrentTabs();
        console.log(currentTabs);
        setTabs(currentTabs);
    };

    const isSelected = (id) => {
        return selected === id;
    };

    const selectTab = (id) => {
        console.log('selectTab');
        window.electronApi.selectTab(id);
    };

    useEffect(() => {
        setTimeout(() => getCurrentTabs(), 500);
    }, []);

    useEffect(() => {
        const handleTabsFound = (_event, value) => {
            console.log('tabsFound', value);
            setTabs(value);
        };

        const handleTabSelected = (_event, value) => {
            console.log('onTabSelected', value);
            setSelected(value);
        };

        window.electronApi.onTabsFound(handleTabsFound);
        window.electronApi.onTabSelected(handleTabSelected);

        // Cleanup listeners on unmount
        return () => {
            // Note: If the API supports removing listeners, do it here
        };
    }, []);

    return (
        <HashRouter>
            <div className={styles.app}>
                <TitleBar />
                <WindowControl />
                <div className={styles.main_container}>
                    <Routes>
                        <Route path="/" element={<Main />} />
                        <Route path="/main_window" element={<Main />} />
                        <Route path="*" element={<Main />} />
                    </Routes>
                    <div className={styles.browser_actions}>
                        <browser-action-list></browser-action-list>
                    </div>
                    <div className={styles.tab_buttons}>
                        {tabs.map((id) => (
                            <button key={id} onClick={() => selectTab(id)}>
                                {id}
                            </button>
                        ))}
                    </div>
                    <div className={styles.tab_container}>
                        {tabs.map((id) => (
                            <Tab key={id} id={id} selected={isSelected(id)} />
                        ))}
                    </div>
                </div>
            </div>
        </HashRouter>
    );
};

export default App;
