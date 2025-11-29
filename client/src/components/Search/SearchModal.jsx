import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, FileText, Users, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './SearchModal.module.css';

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            loadRecentSearches();
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.length > 2) {
            const debounce = setTimeout(() => {
                performSearch();
            }, 300);
            return () => clearTimeout(debounce);
        } else {
            setResults([]);
        }
    }, [query]);

    const loadRecentSearches = () => {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(recent.slice(0, 5));
    };

    const saveRecentSearch = (searchQuery) => {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const updated = [searchQuery, ...recent.filter(q => q !== searchQuery)].slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
            setResults(response.data.data || []);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
        }
    };

    const handleResultClick = (result) => {
        saveRecentSearch(query);
        onClose();

        switch (result.type) {
            case 'employee':
                navigate(`/employees/${result.id}`);
                break;
            case 'document':
                navigate(`/documents/${result.id}`);
                break;
            case 'policy':
                navigate(`/compliance`);
                break;
            default:
                break;
        }
    };

    const handleRecentClick = (searchQuery) => {
        setQuery(searchQuery);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'employee':
                return <Users size={18} />;
            case 'document':
                return <FileText size={18} />;
            case 'policy':
                return <Building size={18} />;
            default:
                return <Search size={18} />;
        }
    };

    const highlightMatch = (text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <mark key={i} className={styles.highlight}>{part}</mark>
                : part
        );
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.searchBox}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search employees, documents, policies..."
                        className={styles.searchInput}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {query && (
                        <button className={styles.clearButton} onClick={() => setQuery('')}>
                            <X size={18} />
                        </button>
                    )}
                    <kbd className={styles.kbd}>ESC</kbd>
                </div>

                <div className={styles.results}>
                    {loading && (
                        <div className={styles.loading}>Searching...</div>
                    )}

                    {!query && recentSearches.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>
                                <Clock size={16} />
                                Recent Searches
                            </div>
                            {recentSearches.map((search, index) => (
                                <div
                                    key={index}
                                    className={styles.recentItem}
                                    onClick={() => handleRecentClick(search)}
                                >
                                    <Search size={16} />
                                    <span>{search}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {query && !loading && results.length === 0 && (
                        <div className={styles.noResults}>
                            No results found for "{query}"
                        </div>
                    )}

                    {results.length > 0 && (
                        <>
                            {['employee', 'document', 'policy'].map(type => {
                                const typeResults = results.filter(r => r.type === type);
                                if (typeResults.length === 0) return null;

                                return (
                                    <div key={type} className={styles.section}>
                                        <div className={styles.sectionTitle}>
                                            {getIcon(type)}
                                            {type.charAt(0).toUpperCase() + type.slice(1)}s
                                            <span className={styles.count}>{typeResults.length}</span>
                                        </div>
                                        {typeResults.map((result, index) => {
                                            const globalIndex = results.indexOf(result);
                                            return (
                                                <div
                                                    key={result.id}
                                                    className={`${styles.resultItem} ${globalIndex === selectedIndex ? styles.selected : ''}`}
                                                    onClick={() => handleResultClick(result)}
                                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                >
                                                    <div className={styles.resultIcon}>
                                                        {getIcon(result.type)}
                                                    </div>
                                                    <div className={styles.resultContent}>
                                                        <div className={styles.resultTitle}>
                                                            {highlightMatch(result.title, query)}
                                                        </div>
                                                        {result.subtitle && (
                                                            <div className={styles.resultSubtitle}>
                                                                {highlightMatch(result.subtitle, query)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <div className={styles.shortcuts}>
                        <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                        <span><kbd>↵</kbd> Select</span>
                        <span><kbd>ESC</kbd> Close</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
