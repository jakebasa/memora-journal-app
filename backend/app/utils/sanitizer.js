import validator from 'validator';

export const sanitizeInput = {
    // Sanitize text content
    text: (input) => {
        if (!input || typeof input !== 'string') return '';
        return validator.escape(input.trim());
    },

    // Sanitize HTML content (for rich text)
    html: (input) => {
        if (!input || typeof input !== 'string') return '';
        // Basic HTML sanitization - remove script tags and dangerous attributes
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '')
            .trim();
    },

    // Sanitize email
    email: (input) => {
        if (!input || typeof input !== 'string') return '';
        return validator.normalizeEmail(input.trim()) || '';
    },

    // Sanitize array of strings (for tags)
    stringArray: (input) => {
        if (!Array.isArray(input)) return [];
        return input
            .filter(item => typeof item === 'string')
            .map(item => validator.escape(item.trim()))
            .filter(item => item.length > 0)
            .slice(0, 10); // Limit to 10 items
    }
};
