import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, ArrowUp, ArrowDown, CornerDownLeft, X, Clock, Zap } from 'lucide-react';
import api from '../../services/api';
import { showToast } from '../../utils/toast';
import styles from './GlobalSearch.module.css';

const GlobalSearch = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ employees: [], candidates: [], jobs: [] });
    const [quickActions, setQuickActions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Load recent searches from localStorage
    useEffect(() => {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(recent.slice(0, 5));
    }, []);

    // Load quick actions
    useEffect(() => {
        if (isOpen) {
            fetchQuickActions();
        }
    }, [isOpen]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Search with debounce
    useEffect(() => {
        if (!query.trim()) {
            setResults({ employees: [], candidates: [], jobs: [] });
            return;
        }

        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const fetchQuickActions = async () => {
        try {
            const response = await api.get('/search/actions');
            setQuickActions(response.data.data);
        } catch (error) {
            console.error('Failed to fetch quick actions:', error);
        }
    };

    const performSearch = async (searchQuery) => {
        setLoading(true);
        try {
            const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
            setResults(response.data.data);
            setSelectedIndex(0);
        } catch (error) {
            console.error('Search failed:', error);
            showToast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const saveRecentSearch = (item) => {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const newRecent = [item, ...recent.filter(r => r.url !== item.url)].slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    };

    const handleSelect = (item) => {
        saveRecentSearch(item);
        navigate(item.url);
        onClose();
        setQuery('');
    };

    const getAllResults = () => {
        const all = [];

        if (query.trim()) {
            results.employees.forEach(item => all.push(item));
            results.candidates.forEach(item => all.push(item));
            results.jobs.forEach(item => all.push(item));
        } else {
            recentSearches.forEach(item => all.push(item));
            quickActions.forEach(item => all.push(item));
        }

        return all;
    };

    const allResults = getAllResults();

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % allResults.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (allResults[selectedIndex]) {
                        handleSelect(allResults[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, allResults]);

    if (!isOpen) return null;

    const hasResults = results.employees.length > 0 || results.candidates.length > 0 || results.jobs.length > 0;
    const showEmpty = query.trim() && !loading && !hasResults;

    return (
        <>
            <div className={styles.backdrop} onClick={onClose} />
            <div className={styles.modal}>
                <div className={styles.searchBox}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search or type a command..."
                        className={styles.input}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button className={styles.clearButton} onClick={() => setQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                    <div className={styles.shortcut}>
                        <Command size={14} />K
                    </div>
                </div>

                <div className={styles.results}>
                    {loading && (
                        <div className={styles.loading}>Searching...</div>
                    )}

                    {showEmpty && (
                        <div className={styles.empty}>
                            <Search size={32} />
                            <p>No results found for "{query}"</p>
                        </div>
                    )}

                    {!query.trim() && recentSearches.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Clock size={16} />
                                <span>Recent</span>
                            </div>
                            {recentSearches.map((item, index) => (
                                <ResultItem
                                    key={item.url}
                                    item={item}
                                    isSelected={selectedIndex === index}
                                    onClick={() => handleSelect(item)}
                                />
                            ))}
                        </div>
                    )}

                    {!query.trim() && quickActions.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Zap size={16} />
                                <span>Quick Actions</span>
                            </div>
                            {quickActions.map((item, index) => (
                                <ResultItem
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedIndex === (recentSearches.length + index)}
                                    onClick={() => handleSelect(item)}
                                />
                            ))}
                        </div>
                    )}

                    {hasResults && (
                        <>
                            {results.employees.length > 0 && (
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <span>👥 Employees ({results.employees.length})</span>
                                    </div>
                                    {results.employees.map((item, index) => (
                                        <ResultItem
                                            key={item.id}
                                            item={item}
                                            isSelected={selectedIndex === index}
                                            onClick={() => handleSelect(item)}
                                        />
                                    ))}
                                </div>
                            )}

                            {results.candidates.length > 0 && (
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <span>🎯 Candidates ({results.candidates.length})</span>
                                    </div>
                                    {results.candidates.map((item, index) => (
                                        <ResultItem
                                            key={item.id}
                                            item={item}
                                            isSelected={selectedIndex === (results.employees.length + index)}
                                            onClick={() => handleSelect(item)}
                                        />
                                    ))}
                                </div>
                            )}

                            {results.jobs.length > 0 && (
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <span>💼 Jobs ({results.jobs.length})</span>
                                    </div>
                                    {results.jobs.map((item, index) => (
                                        <ResultItem
                                            key={item.id}
                                            item={item}
                                            isSelected={selectedIndex === (results.employees.length + results.candidates.length + index)}
                                            onClick={() => handleSelect(item)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <div className={styles.hint}>
                        <ArrowUp size={12} />
                        <ArrowDown size={12} />
                        <span>Navigate</span>
                    </div>
                    <div className={styles.hint}>
                        <CornerDownLeft size={12} />
                        <span>Select</span>
                    </div>
                    <div className={styles.hint}>
                        <span>ESC</span>
                        <span>Close</span>
                    </div>
                </div>
            </div>
        </>
    );
};

const ResultItem = ({ item, isSelected, onClick }) => {
    return (
        <div
            className={`${styles.resultItem} ${isSelected ? styles.selected : ''}`}
            onClick={onClick}
        >
            <div className={styles.resultContent}>
                <div className={styles.resultTitle}>{item.title}</div>
                <div className={styles.resultSubtitle}>{item.subtitle}</div>
            </div>
            {isSelected && (
                <CornerDownLeft size={14} className={styles.enterIcon} />
            )}
        </div>
    );
};

export default GlobalSearch;
