import React, { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumbs from '../UI/Breadcrumbs';
import styles from './MainLayout.module.css';

// Create context for search
export const SearchContext = createContext();

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className={styles.main}>
                <Header
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                />
                <main className={styles.content}>
                    <Breadcrumbs />
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
