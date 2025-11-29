import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Bot } from 'lucide-react';
import api from '../../services/api';
import styles from './AIAssistant.module.css';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm Zyvra AI. Ask me about your leaves, policies, or payroll.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/ai/chat', { message: userMsg.text });
            const botMsg = {
                id: Date.now() + 1,
                text: response.data.data.message,
                sender: 'bot',
                action: response.data.data.action
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I'm having trouble thinking right now.", sender: 'bot' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
            {!isOpen && (
                <button className={styles.fab} onClick={() => setIsOpen(true)}>
                    <Bot size={24} />
                    <span className={styles.fabText}>AI Help</span>
                </button>
            )}

            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>
                            <Sparkles size={18} className={styles.sparkleIcon} />
                            <span>Zyvra AI Assistant</span>
                        </div>
                        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.messages}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`${styles.message} ${styles[msg.sender]}`}>
                                {msg.sender === 'bot' && <Bot size={16} className={styles.botIcon} />}
                                <div className={styles.bubble}>
                                    {msg.text}
                                    {msg.action && (
                                        <button className={styles.actionButton}>
                                            {msg.action.replace('_', ' ')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className={`${styles.message} ${styles.bot}`}>
                                <Bot size={16} className={styles.botIcon} />
                                <div className={`${styles.bubble} ${styles.typing}`}>
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything..."
                            className={styles.input}
                        />
                        <button className={styles.sendButton} onClick={handleSend} disabled={!input.trim()}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
