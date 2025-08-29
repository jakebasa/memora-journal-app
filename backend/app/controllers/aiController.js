// This is a placeholder. Replace with actual AI API integration later.
export const summarizeEntry = async (req, res) => {
    const { entryId } = req.body;

    // For now, just return a dummy summary
    res.status(200).json({
        entryId,
        summary: 'This is a dummy summary of the entry.',
    });
};

export const getInsights = async (req, res) => {
    const { entryId } = req.body;

    // Dummy AI insights
    res.status(200).json({
        entryId,
        insights: 'You seem to be writing positively more often this week.',
    });
};

export const generatePrompt = async (req, res) => {
    // Dummy prompt
    res.status(200).json({
        prompt: 'Write about a moment that made you smile today.',
    });
};

export const moodAnalysis = async (req, res) => {
    const { entryId } = req.body;

    res.status(200).json({
        entryId,
        mood: '😊',
    });
};

export const getTrends = async (req, res) => {
    res.status(200).json({
        trends: 'You’ve been stressed more this month.',
    });
};

import Entry from '../models/Entry.js';
import { ai } from '../services/gemini.js';

export const chatAssistant = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: 'No user ID found in request',
            });
        }

        const msg = message.toLowerCase();

        // Handle request for last 5 days summary
        // For testing: show all entries
        // Find entries by keyword/topic
        if (
            msg.includes('find entries about') ||
            msg.includes('search for entries about')
        ) {
            const searchTerm = message
                .toLowerCase()
                .replace('find entries about ', '')
                .replace('search for entries about ', '');

            const entries = await Entry.find({
                userId: userId,
                $or: [
                    { content: { $regex: searchTerm, $options: 'i' } },
                    { title: { $regex: searchTerm, $options: 'i' } },
                    { tags: { $regex: searchTerm, $options: 'i' } },
                ],
            }).sort({ date: -1 });

            if (entries.length === 0) {
                return res.json({
                    response: `I couldn't find any entries about "${searchTerm}".`,
                });
            }

            const entriesText = entries
                .map(
                    (entry) =>
                        `Date: ${entry.date.toISOString().split('T')[0]}\n${
                            entry.content
                        }`
                )
                .join('\n\n');

            const prompt = `Analyze these journal entries about "${searchTerm}". Summarize the key thoughts, feelings, and patterns related to this topic:\n\n${entriesText}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const text = response.candidates[0].content.parts[0].text;
            return res.json({ response: text });
        }

        // Analyze mood patterns
        if (
            msg.includes('analyze my mood') ||
            msg.includes('how am i feeling')
        ) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const entries = await Entry.find({
                userId: userId,
                date: { $gte: thirtyDaysAgo },
            }).sort({ date: 1 });

            if (entries.length === 0) {
                return res.json({
                    response:
                        "I don't have enough entries to analyze your mood patterns.",
                });
            }

            const entriesText = entries
                .map(
                    (entry) =>
                        `Date: ${
                            entry.date.toISOString().split('T')[0]
                        }\nMood: ${entry.mood || 'not specified'}\n${
                            entry.content
                        }`
                )
                .join('\n\n');

            const prompt = `Analyze the mood patterns in these journal entries from the last 30 days. Consider both the explicit mood markers and the emotional tone of the writing. Provide insights about emotional patterns, triggers, and overall mental well-being:\n\n${entriesText}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const text = response.candidates[0].content.parts[0].text;
            return res.json({ response: text });
        }

        // Get writing prompts
        if (
            msg.includes('give me a prompt') ||
            msg.includes('journal prompt')
        ) {
            const promptTypes = {
                'self-reflection':
                    'Write a reflective entry about your personal growth',
                gratitude: 'What are you most grateful for today?',
                goals: 'What goals would you like to set?',
                emotions: 'How are you feeling right now and why?',
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a thought-provoking and introspective journal prompt. Make it specific and meaningful. Consider these areas: ${Object.keys(
                    promptTypes
                ).join(', ')}`,
            });
            const prompt = response.candidates[0].content.parts[0].text;
            return res.json({ response: prompt });
        }

        // Get advice based on journal entries
        if (
            msg.includes('give me advice') ||
            msg.includes('what should i do')
        ) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const entries = await Entry.find({
                userId: userId,
                date: { $gte: thirtyDaysAgo },
            }).sort({ date: -1 });

            if (entries.length === 0) {
                return res.json({
                    response:
                        "I need some recent journal entries to provide meaningful advice. Please write about what's on your mind first.",
                });
            }

            const entriesText = entries
                .map((entry) => {
                    const localDate = new Date(entry.date);
                    return `Date: ${localDate.getFullYear()}-${String(
                        localDate.getMonth() + 1
                    ).padStart(2, '0')}-${String(localDate.getDate()).padStart(
                        2,
                        '0'
                    )}\n${entry.content}`;
                })
                .join('\n\n');

            const prompt = `Based on these journal entries, provide thoughtful and constructive advice. Consider patterns, challenges, and opportunities for growth. Be supportive and encouraging:\n\n${entriesText}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const advice = response.candidates[0].content.parts[0].text;
            return res.json({ response: advice });
        }

        // Handle date-specific queries
        if (
            msg.includes('what happened') ||
            msg.includes('show entries from')
        ) {
            let targetDate;
            let endDate;

            if (msg.includes('last month this day')) {
                targetDate = new Date();
                targetDate.setMonth(targetDate.getMonth() - 1);
                targetDate.setHours(0, 0, 0, 0);
                endDate = new Date(targetDate);
                endDate.setHours(23, 59, 59, 999);
            } else if (msg.includes('last week')) {
                targetDate = new Date();
                targetDate.setDate(targetDate.getDate() - 7);
                targetDate.setHours(0, 0, 0, 0);
                endDate = new Date();
            } else {
                // Try to parse specific date
                const dateStr = message
                    .toLowerCase()
                    .replace('what happened on ', '')
                    .replace('what happened in ', '');

                targetDate = new Date(dateStr);
                if (!isNaN(targetDate.getTime())) {
                    // Create dates in local timezone
                    targetDate = new Date(
                        targetDate.getFullYear(),
                        targetDate.getMonth(),
                        targetDate.getDate(),
                        0,
                        0,
                        0,
                        0
                    );
                    endDate = new Date(
                        targetDate.getFullYear(),
                        targetDate.getMonth(),
                        targetDate.getDate(),
                        23,
                        59,
                        59,
                        999
                    );
                }
            }

            if (!targetDate || isNaN(targetDate.getTime())) {
                return res.json({
                    response:
                        "I couldn't understand the date you're asking about. Try formats like 'what happened last week', 'what happened last month this day', or 'what happened on April 28, 2025'",
                });
            }

            const query = {
                userId,
                date: {
                    $gte: targetDate,
                    $lte: endDate,
                },
            };

            const entries = await Entry.find(query).sort({ date: 1 });

            if (entries.length === 0) {
                const formattedDate = `${targetDate.getFullYear()}-${String(
                    targetDate.getMonth() + 1
                ).padStart(2, '0')}-${String(targetDate.getDate()).padStart(
                    2,
                    '0'
                )}`;
                return res.json({
                    response: `I couldn't find any entries from ${formattedDate}`,
                });
            }

            const entriesText = entries
                .map(
                    (entry) =>
                        `Date: ${entry.date.toISOString().split('T')[0]}\n${
                            entry.content
                        }`
                )
                .join('\n\n');

            const prompt = `Summarize these journal entries. Focus on the main events, thoughts, and feelings from this time period:\n\n${entriesText}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const text = response.candidates[0].content.parts[0].text;
            return res.json({ response: text });
        }

        if (msg.includes('show all entries')) {
            const allEntries = await Entry.find({
                userId: userId, // This should match the ID from your token
            }).sort({ date: -1 });

            console.log('Query Debug:', {
                searchedUserId: userId,
                foundEntries: allEntries.length,
            });

            if (allEntries.length === 0) {
                return res.json({
                    response: "You don't have any entries yet.",
                });
            }

            const entriesSummary = allEntries.map((entry) => ({
                date: entry.date.toISOString().split('T')[0],
                title: entry.title,
                content: entry.content,
                mood: entry.mood,
            }));

            return res.json({
                response: 'Here are all your entries:',
                entries: entriesSummary,
            });
        }

        if (
            message.toLowerCase().includes('summarize last five days') ||
            message.toLowerCase().includes('summarize last 5 days')
        ) {
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

            const entries = await Entry.find({
                userId: userId,
                date: { $gte: fiveDaysAgo },
            }).sort({ date: 1 });

            if (entries.length === 0) {
                return res.json({
                    response:
                        "You don't have any entries from the last five days.",
                });
            }

            // Prepare entries for AI prompt
            const entriesText = entries
                .map(
                    (entry) =>
                        `Date: ${entry.date.toISOString().split('T')[0]}\n${
                            entry.content
                        }`
                )
                .join('\n\n');

            const prompt = `Please summarize these journal entries from the last 5 days. Focus on main themes, emotional patterns, and key events. Keep it concise:\n\n${entriesText}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            res.json({ response });
        } else {
            res.json({
                response: `I can help you analyze your journal entries. Try these commands:
1. "summarize last five days" - Get a summary of recent entries
2. "find entries about [topic]" - Search entries by topic or keyword
3. "analyze my mood" or "how am i feeling" - Get mood analysis for the last 30 days
4. "show all entries" - List all your journal entries
5. "what happened last week" - See entries from the past week
6. "what happened last month this day" - See entries from this day last month
7. "what happened on April 28, 2025" - See entries from a specific date
8. "give me a prompt" - Get a thoughtful journaling prompt
9. "give me advice" - Get personalized advice based on your entries`,
            });
        }
    } catch (error) {
        console.error('Chat Assistant Error:', error);
        res.status(500).json({
            error: 'An error occurred while processing your request',
        });
    }
};
