const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// --- 1. Chatbot Logic (Rule-based/NLP) ---
const processChat = async (req, res) => {
    try {
        const { message } = req.body;
        const lowerMsg = message.toLowerCase();
        let response = "I'm not sure I understand. Try asking about 'leave balance', 'policy', or 'holiday'.";
        let action = null;

        // Simple Intent Classification (Free & Local)
        if (lowerMsg.includes('leave') && (lowerMsg.includes('balance') || lowerMsg.includes('many'))) {
            response = "You have 12 Annual Leave days and 5 Sick Leave days remaining.";
            action = 'VIEW_LEAVES';
        } else if (lowerMsg.includes('apply') && lowerMsg.includes('leave')) {
            response = "Sure, I can help you apply for leave. What dates are you looking at?";
            action = 'APPLY_LEAVE';
        } else if (lowerMsg.includes('policy') || lowerMsg.includes('handbook')) {
            response = "You can find the Employee Handbook in the Documents section.";
            action = 'VIEW_DOCUMENTS';
        } else if (lowerMsg.includes('holiday') || lowerMsg.includes('off')) {
            response = "The next holiday is 'Thanksgiving' on Nov 28th.";
        } else if (lowerMsg.includes('salary') || lowerMsg.includes('payslip')) {
            response = "Your latest payslip for October 2025 has been generated.";
            action = 'VIEW_PAYROLL';
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            response = "Hello! I'm Zyvra AI. How can I assist you today?";
        }

        res.json({
            success: true,
            data: {
                message: response,
                action
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'AI processing failed' });
    }
};

// --- 2. Sentiment Analysis (Local Lib) ---
const analyzeSentiment = async (req, res) => {
    try {
        const { text } = req.body;
        const result = sentiment.analyze(text);

        // Normalize score to -1 to 1 range (approx) or just return raw
        // result.score: Positive number = Good, Negative = Bad

        let label = 'Neutral';
        if (result.score > 2) label = 'Positive';
        if (result.score < -2) label = 'Negative';

        res.json({
            success: true,
            data: {
                score: result.score,
                comparative: result.comparative,
                label,
                keywords: result.words
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Sentiment analysis failed' });
    }
};

// --- 3. Resume Parser (Regex/Keyword) ---
const parseResume = async (req, res) => {
    try {
        const { text } = req.body; // Assuming text is extracted on client or via another service

        // Simple extraction logic
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/im;

        const emails = text.match(emailRegex) || [];
        const phones = text.match(phoneRegex) || [];

        // Skill keyword matching
        const commonSkills = ['javascript', 'react', 'node', 'python', 'java', 'sql', 'aws', 'docker', 'communication', 'leadership'];
        const foundSkills = commonSkills.filter(skill => text.toLowerCase().includes(skill));

        res.json({
            success: true,
            data: {
                email: emails[0] || null,
                phone: phones[0] || null,
                skills: foundSkills,
                suggestedRole: foundSkills.includes('react') ? 'Frontend Developer' : 'General Applicant'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Resume parsing failed' });
    }
};

module.exports = {
    processChat,
    analyzeSentiment,
    parseResume
};
